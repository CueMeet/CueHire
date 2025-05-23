import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home(): JSX.Element {
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
          <div className="col col--6">
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
          <div className="col col--6">
            <div className={clsx('card', styles.card)}>
              <div className="card__header">
                <h2>Installation Guide</h2>
              </div>
              <div className="card__body">
                <p>
                  Get started with CueHire by following our step-by-step installation and setup guide.
                </p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/tutorial-basics/installation">
                  Start Installation →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
