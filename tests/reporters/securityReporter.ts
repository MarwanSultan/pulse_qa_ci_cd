/**
 * Security Reporter for Enterprise Testing
 * Implements intelligence community security scanning and compliance reporting
 */

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface SecurityScan {
  vulnerabilities: SecurityIssue[];
  compliance: ComplianceStatus;
  riskAssessment: RiskLevel;
  recommendations: string[];
}

interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  description: string;
  testName: string;
  evidence: string;
  remediation: string;
}

interface ComplianceStatus {
  fedramp: boolean;
  soc2: boolean;
  iso27001: boolean;
  pci: boolean;
  customPolicies: Record<string, boolean>;
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

class SecurityReporter implements Reporter {
  private securityIssues: SecurityIssue[] = [];
  private complianceChecks: Partial<ComplianceStatus> = {};

  onTestEnd(test: TestCase, result: TestResult): void {
    // Intelligence community: comprehensive security analysis
    this.scanForVulnerabilities(test, result);
    this.checkCompliance(test, result);
    this.assessRisk(test, result);
  }

  onEnd(): void {
    const securityReport: SecurityScan = {
      vulnerabilities: this.securityIssues,
      compliance: this.getComplianceStatus(),
      riskAssessment: this.calculateRiskLevel(),
      recommendations: this.generateSecurityRecommendations(),
    };

    // Write security report
    const reportPath = path.join(process.cwd(), 'test-results', 'security-scan.json');
    fs.writeFileSync(reportPath, JSON.stringify(securityReport, null, 2));

    // Intelligence community: classified security briefing
    this.generateClassifiedSecurityBriefing(securityReport);

    console.log('🔒 Security Scan Completed:', reportPath);
    console.log(`🚨 Vulnerabilities Found: ${securityReport.vulnerabilities.length}`);
    console.log(`🛡️  Risk Level: ${securityReport.riskAssessment}`);
    console.log(`📋 Compliance: ${this.getComplianceSummary(securityReport.compliance)}`);
  }

  private scanForVulnerabilities(test: TestCase, result: TestResult): void {
    const errorMessage = result.error?.message || '';
    const testName = test.title;

    // Intelligence community: advanced vulnerability patterns
    const vulnerabilityPatterns = [
      {
        pattern: /xss|cross.site.scripting/i,
        type: 'XSS',
        severity: 'HIGH' as const,
        remediation: 'Implement proper input sanitization and CSP headers',
      },
      {
        pattern: /sql.injection/i,
        type: 'SQL Injection',
        severity: 'CRITICAL' as const,
        remediation: 'Use parameterized queries and input validation',
      },
      {
        pattern: /authentication.failed|unauthorized/i,
        type: 'Authentication Bypass',
        severity: 'CRITICAL' as const,
        remediation: 'Implement multi-factor authentication and session management',
      },
      {
        pattern: /session.hijack|cookie.theft/i,
        type: 'Session Hijacking',
        severity: 'HIGH' as const,
        remediation: 'Use secure session tokens and HTTPS-only cookies',
      },
      {
        pattern: /path.traversal|directory.traversal/i,
        type: 'Path Traversal',
        severity: 'HIGH' as const,
        remediation: 'Validate and sanitize file paths',
      },
      {
        pattern: /command.injection/i,
        type: 'Command Injection',
        severity: 'CRITICAL' as const,
        remediation: 'Avoid shell commands, use safe APIs',
      },
    ];

    vulnerabilityPatterns.forEach(({ pattern, type, severity, remediation }) => {
      if (pattern.test(errorMessage)) {
        this.securityIssues.push({
          severity,
          type,
          description: `Potential ${type} vulnerability detected`,
          testName,
          evidence: errorMessage.substring(0, 200),
          remediation,
        });
      }
    });

    // Additional security checks
    this.checkForSensitiveDataLeakage(test, result);
    this.checkForInsecureConfigurations(test, result);
  }

  private checkForSensitiveDataLeakage(test: TestCase, result: TestResult): void {
    const errorMessage = result.error?.message || '';
    const sensitivePatterns = [
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
      /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{10}\b/, // Phone number
      /password|token|key|secret/i, // Generic sensitive terms
    ];

    sensitivePatterns.forEach((pattern) => {
      if (pattern.test(errorMessage)) {
        this.securityIssues.push({
          severity: 'HIGH',
          type: 'Sensitive Data Leakage',
          description: 'Potential sensitive data exposure in test output',
          testName: test.title,
          evidence: 'Pattern match in error message',
          remediation: 'Remove sensitive data from test outputs and logs',
        });
      }
    });
  }

  private checkForInsecureConfigurations(test: TestCase, result: TestResult): void {
    const errorMessage = result.error?.message || '';

    // Check for insecure protocol usage
    if (errorMessage.includes('http://') && !errorMessage.includes('localhost')) {
      this.securityIssues.push({
        severity: 'MEDIUM',
        type: 'Insecure Protocol',
        description: 'HTTP protocol used instead of HTTPS',
        testName: test.title,
        evidence: errorMessage,
        remediation: 'Use HTTPS for all external communications',
      });
    }

    // Check for weak encryption
    if (errorMessage.includes('MD5') || errorMessage.includes('SHA-1')) {
      this.securityIssues.push({
        severity: 'MEDIUM',
        type: 'Weak Cryptography',
        description: 'Weak cryptographic algorithm detected',
        testName: test.title,
        evidence: errorMessage,
        remediation: 'Upgrade to SHA-256 or stronger algorithms',
      });
    }
  }

  private checkCompliance(test: TestCase, result: TestResult): void {
    // Intelligence community: compliance validation
    const testName = test.title.toLowerCase();

    // FedRAMP compliance checks
    if (testName.includes('security') || testName.includes('auth')) {
      this.complianceChecks.fedramp = result.status === 'passed';
    }

    // SOC 2 compliance
    if (testName.includes('audit') || testName.includes('log')) {
      this.complianceChecks.soc2 = result.status === 'passed';
    }

    // ISO 27001
    if (testName.includes('access') || testName.includes('control')) {
      this.complianceChecks.iso27001 = result.status === 'passed';
    }

    // PCI compliance
    if (testName.includes('payment') || testName.includes('card')) {
      this.complianceChecks.pci = result.status === 'passed';
    }
  }

  private assessRisk(test: TestCase, result: TestResult): void {
    // Intelligence community: risk assessment
    // This would integrate with threat intelligence feeds in production
    if (result.status === 'failed') {
      const errorMessage = result.error?.message || '';

      if (errorMessage.includes('authentication') || errorMessage.includes('authorization')) {
        // High risk security failure
        this.securityIssues.push({
          severity: 'CRITICAL',
          type: 'Security Control Failure',
          description: 'Critical security control failed',
          testName: test.title,
          evidence: errorMessage,
          remediation: 'Immediate security review required',
        });
      }
    }
  }

  private getComplianceStatus(): ComplianceStatus {
    return {
      fedramp: this.complianceChecks.fedramp ?? false,
      soc2: this.complianceChecks.soc2 ?? false,
      iso27001: this.complianceChecks.iso27001 ?? false,
      pci: this.complianceChecks.pci ?? false,
      customPolicies: {
        'intelligence-community': this.securityIssues.length === 0,
        'zero-trust': !this.securityIssues.some((issue) => issue.severity === 'CRITICAL'),
      },
    };
  }

  private calculateRiskLevel(): RiskLevel {
    const criticalCount = this.securityIssues.filter(
      (issue) => issue.severity === 'CRITICAL',
    ).length;
    const highCount = this.securityIssues.filter((issue) => issue.severity === 'HIGH').length;

    if (criticalCount > 0) return 'CRITICAL';
    if (highCount > 2) return 'HIGH';
    if (highCount > 0 || this.securityIssues.length > 3) return 'MEDIUM';
    return 'LOW';
  }

  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.securityIssues.some((issue) => issue.type === 'XSS')) {
      recommendations.push('Implement Content Security Policy (CSP) headers');
    }

    if (this.securityIssues.some((issue) => issue.type === 'SQL Injection')) {
      recommendations.push('Implement Web Application Firewall (WAF)');
    }

    if (this.securityIssues.some((issue) => issue.type === 'Authentication Bypass')) {
      recommendations.push('Implement multi-factor authentication');
    }

    if (this.securityIssues.length === 0) {
      recommendations.push('Security posture is strong - continue regular assessments');
    }

    return recommendations;
  }

  private getComplianceSummary(compliance: ComplianceStatus): string {
    const compliant = Object.values(compliance).filter(Boolean).length;
    const total = Object.keys(compliance).length;
    return `${compliant}/${total} standards met`;
  }

  private generateClassifiedSecurityBriefing(report: SecurityScan): void {
    // Intelligence community: classified security reporting
    const briefing = {
      classification: 'TOP SECRET//SI//NOFORN',
      threatLevel: report.riskAssessment,
      executiveSummary: {
        vulnerabilities: report.vulnerabilities.length,
        complianceStatus: this.getComplianceSummary(report.compliance),
        immediateActions: report.vulnerabilities
          .filter((v) => v.severity === 'CRITICAL')
          .map((v) => v.remediation),
      },
      intelligence: {
        attackVectors: this.identifyAttackVectors(),
        threatActors: this.assessThreatActors(),
        recommendedCountermeasures: report.recommendations,
      },
    };

    const briefingPath = path.join(
      process.cwd(),
      'test-results',
      'classified-security-briefing.json',
    );
    fs.writeFileSync(briefingPath, JSON.stringify(briefing, null, 2));
  }

  private identifyAttackVectors(): string[] {
    const vectors: string[] = [];

    if (this.securityIssues.some((issue) => issue.type.includes('Injection'))) {
      vectors.push('Code Injection');
    }

    if (this.securityIssues.some((issue) => issue.type.includes('XSS'))) {
      vectors.push('Client-side Attacks');
    }

    if (this.securityIssues.some((issue) => issue.type.includes('Authentication'))) {
      vectors.push('Identity-based Attacks');
    }

    return vectors;
  }

  private assessThreatActors(): string[] {
    // Intelligence community: threat actor profiling
    const actors: string[] = [];

    if (this.securityIssues.some((issue) => issue.severity === 'CRITICAL')) {
      actors.push('Advanced Persistent Threat (APT)');
    }

    if (this.securityIssues.some((issue) => issue.type.includes('Injection'))) {
      actors.push('Script Kiddies');
    }

    if (this.securityIssues.length > 5) {
      actors.push('Organized Crime');
    }

    return actors;
  }
}

export default SecurityReporter;
