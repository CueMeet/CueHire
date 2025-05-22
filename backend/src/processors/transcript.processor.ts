import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  TRANSCRIPT_PROCESSING_QUEUE,
  TRANSCRIPT_PROCESSING_JOB,
} from '../constants/bull-queue';
import { CueMeetService } from '../providers/cuemeet/cuemeet.service';
import { Meeting, ExecutionLog, Job as JobModel } from '../database/models';
import { GEMINI_API_KEY } from '../constants/config';
import { ExecutionLogEnum } from 'src/database/models/execution-log.model';

interface TranscriptProcessingData {
  meetingId: string;
  botId: string;
  apiKey: string;
  jobId: string;
}

interface TranscriptSegment {
  id: string;
  speaker: string;
  transcription_start_time_milliseconds: string;
  transcription_end_time_milliseconds: string;
  transcription_Data: string;
}

interface ProcessedTranscript {
  summary: string;
  scorecard: {
    technical_skills: number;
    communication_skills: number;
    problem_solving: number;
    culture_fit: number;
  };
}

@Injectable()
@Processor(TRANSCRIPT_PROCESSING_QUEUE)
export class TranscriptProcessor {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(TranscriptProcessor.name);
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor(private readonly cueMeetService: CueMeetService) {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount = 0,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error?.status === 503 &&
        retryCount < this.MAX_RETRIES &&
        error?.message?.includes('model is overloaded')
      ) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        this.logger.warn(
          `Gemini API overloaded (attempt ${retryCount + 1}/${this.MAX_RETRIES}). Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithBackoff(operation, retryCount + 1);
      }
      throw error;
    }
  }

  @Process(TRANSCRIPT_PROCESSING_JOB)
  async processTranscript(job: Job<TranscriptProcessingData>): Promise<void> {
    const { meetingId, botId, apiKey, jobId } = job.data;

    try {
      // Get all transcripts using pagination
      let allTranscripts: TranscriptSegment[] = [];
      let page = 1;
      const limit = 50;

      while (true) {
        const result = await this.cueMeetService.retrieveTranscript(
          apiKey,
          botId,
          { page, limit },
        );

        if (!result || !result.transcript || !result.transcript.length) {
          break;
        }

        allTranscripts = [...allTranscripts, ...result.transcript];

        if (!result.hasMore) {
          break;
        }

        page++;
      }

      if (allTranscripts.length === 0) {
        throw new Error('No transcripts found');
      }

      // Combine all transcripts into a single conversation string
      const conversation = allTranscripts
        .map((t) => `${t.speaker}: ${t.transcription_Data}`)
        .join('\n');

      const jobData = await JobModel.findByPk(jobId);

      // Process with Gemini using retry mechanism
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt = [
        'You are an expert interviewer and hiring evaluator. Below is a transcript from a job interview.',
        '',
        `Job Title: ${jobData.dataValues.title}`,
        `Job Description: ${jobData.dataValues.description}`,
        '',
        'Please analyze the transcript carefully and provide a structured assessment. Your output must be a valid JSON object with the following two fields:',
        '',
        '1. **summary** (string, max 250 words):',
        '   - Provide a clear, concise summary of the interview.',
        "   - Highlight the candidate's key strengths, concerns, and overall impression.",
        '   - Focus on how well the candidate aligns with the role based on their answers.',
        '',
        '2. **scorecard** (object with numeric scores between 0–100):',
        '   - **technical_skills**: Rate the depth and relevance of technical expertise demonstrated.',
        '   - **communication_skills**: Evaluate clarity, articulation, confidence, and ability to engage.',
        '   - **problem_solving**: Assess critical thinking, reasoning, and ability to approach challenges.',
        '   - **culture_fit**: Judge alignment with company values, attitude, collaboration style, and adaptability.',
        '',
        'If the transcript is not an interview (for example, it is off-topic, chit-chat, or not a job interview), your response must be:',
        '```json',
        '{',
        '  "summary": "Not an interview talks",',
        '  "scorecard": {',
        '    "technical_skills": 0,',
        '    "communication_skills": 0,',
        '    "problem_solving": 0,',
        '    "culture_fit": 0',
        '  }',
        '}',
        '```',
        '',
        'Format strictly as:',
        '',
        '```json',
        '{',
        '  "summary": "Your 250-word analysis here.",',
        '  "scorecard": {',
        '    "technical_skills": 0,',
        '    "communication_skills": 0,',
        '    "problem_solving": 0,',
        '    "culture_fit": 0',
        '  }',
        '}',
        '```',
        '',
        'Interview Transcript:',
        conversation,
        '',
      ].join('\n');

      const result = await this.retryWithBackoff(async () => {
        const response = await model.generateContent(prompt);
        return response.response;
      });

      // Clean the response text by removing markdown code block formatting
      const cleanJsonText = result
        .text()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const processedData: ProcessedTranscript = JSON.parse(cleanJsonText);

      // Update the meeting with processed data
      await Meeting.update(
        {
          hasTranscription: true,
          transcriptionSummary: processedData.summary,
          technicalSkillsScore: processedData.scorecard.technical_skills,
          communicationSkillsScore:
            processedData.scorecard.communication_skills,
          problemSolvingScore: processedData.scorecard.problem_solving,
          cultureFitScore: processedData.scorecard.culture_fit,
        },
        {
          where: { meetingId },
        },
      );

      // Update execution log status
      await ExecutionLog.update(
        { status: ExecutionLogEnum.COMPLETED },
        { where: { jobId, botId } },
      );
    } catch (error) {
      this.logger.error(
        `Error processing transcript for meeting ${meetingId}:`,
        error.stack,
      );

      // Update execution log status to failed with error details
      await ExecutionLog.update(
        {
          status: 'FAILED',
          errorDetails: error.message || 'Unknown error occurred',
        },
        { where: { meetingId, botId } },
      );

      // If it's a permanent error (not a retryable one), throw it to mark the job as failed
      if (
        error?.status !== 503 ||
        !error?.message?.includes('model is overloaded')
      ) {
        throw error;
      }
    }
  }
}
