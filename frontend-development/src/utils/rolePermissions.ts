import type { UserRole } from '../services/authService';

/**
 * Check if user is CEO
 */
export function isCEO(role: UserRole | undefined): boolean {
  return role === 'CEO';
}

/**
 * Check if user is COO (any type)
 */
export function isCOO(role: UserRole | undefined): boolean {
  return role?.startsWith('COO-') || false;
}

/**
 * Check if user is COO Tax-Audit (Suparna Wijaya)
 */
export function isCOOTaxAudit(role: UserRole | undefined): boolean {
  return role === 'COO-Tax-Audit';
}

/**
 * Check if user is COO Legal TP-SR (Ferry Irawan)
 */
export function isCOOLegalTPSR(role: UserRole | undefined): boolean {
  return role === 'COO-Legal-TP-SR';
}

/**
 * Check if user can approve proposals
 */
export function canApproveProposals(role: UserRole | undefined): boolean {
  return isCEO(role);
}

/**
 * Check if user can approve expense letters (EL)
 */
export function canApproveEL(role: UserRole | undefined): boolean {
  return isCEO(role);
}

/**
 * Check if user can approve invoices
 */
export function canApproveInvoices(role: UserRole | undefined): boolean {
  return isCEO(role);
}

/**
 * Check if user can assign PM to a project based on service
 */
export function canAssignPM(role: UserRole | undefined, serviceName: string): boolean {
  if (!role) return false;
  
  // CEO can only assign PM for WEB DEV
  if (isCEO(role)) {
    return serviceName.toLowerCase().includes('web dev') || serviceName.toLowerCase().includes('web development');
  }
  
  // COO can assign PM based on their responsibility
  if (isCOO(role)) {
    // COO Tax-Audit (Suparna Wijaya) can assign for Tax and Audit services
    if (isCOOTaxAudit(role)) {
      const serviceLower = serviceName.toLowerCase();
      return serviceLower.includes('tax') || serviceLower.includes('audit');
    }
    
    // COO Legal TP-SR (Ferry Irawan) can assign for Legal, Transfer Pricing, and Sustainability Report services
    if (isCOOLegalTPSR(role)) {
      const serviceLower = serviceName.toLowerCase();
      return serviceLower.includes('legal') || 
             serviceLower.includes('transfer pricing') || 
             serviceLower.includes('sustainability report') ||
             serviceLower.includes('tp') || 
             serviceLower.includes('sr');
    }
  }
  
  return false;
}

/**
 * Get services that a COO can manage
 */
export function getCOOManageableServices(role: UserRole | undefined): string[] {
  if (isCOOTaxAudit(role)) {
    return ['Tax', 'Audit'];
  }
  
  if (isCOOLegalTPSR(role)) {
    return ['Legal', 'Transfer Pricing', 'Sustainability Report'];
  }
  
  return [];
}

