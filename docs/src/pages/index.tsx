import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Welcome to CueHire Documentation"
      description="Modern recruitment and hiring platform documentation">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">Welcome to CueHire</h1>
          <p className="hero__subtitle">
            A modern recruitment and hiring platform designed to streamline the interview and hiring process
          </p>
        </div>
      </header>
      <main className="container padding-vert--xl">
        <div className="row">
          <div className="col col--4">
            <div className={clsx('card', styles.card)}>
              <div className="card__header">
                <h2>Introduction</h2>
              </div>
              <div className="card__body">
                <p>
                  Learn about CueHire's features, architecture, and how it can help streamline your recruitment process.
                </p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/intro">
                  Read Introduction →
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.card)}>
              <div className="card__header">
                <h2>Docker Installation</h2>
              </div>
              <div className="card__body">
                <p>
                  Get started quickly with our Docker-based installation, providing an isolated environment with all dependencies pre-configured.
                </p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/tutorial-basics/docker-installation">
                  Docker Setup →
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.card)}>
              <div className="card__header">
                <h2>Direct Installation</h2>
              </div>
              <div className="card__body">
                <p>
                  Set up CueHire directly on your machine for more control over individual service configurations.
                </p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/tutorial-basics/direct-installation">
                  Direct Setup →
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="row margin-top--lg">
          <div className="col col--12">
            <div className={clsx('card', styles.card)}>
              <div className="card__header">
                <h2>Installation Overview</h2>
              </div>
              <div className="card__body">
                <p>
                  Not sure which installation method to choose? Check our installation overview guide to help you decide.
                </p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--secondary button--block"
                  to="/docs/tutorial-basics/installation">
                  View Installation Overview →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
