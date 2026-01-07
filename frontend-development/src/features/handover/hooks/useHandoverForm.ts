import { useMemo } from 'react';
import type { RevisionComment } from '../../../lib/projectWorkflowTypes';
import type { SectionId } from '../types';
import { SECTION_NAMES } from '../constants';

interface UseHandoverFormProps {
  revisionComments: RevisionComment[];
  sectionId: SectionId;
}

/**
 * Custom hook to compute section-specific derived state
 */
export function useHandoverForm({ revisionComments, sectionId }: UseHandoverFormProps) {
  const sectionName = SECTION_NAMES[sectionId];
  
  const hasRevision = useMemo(() => {
    return revisionComments.some(r => 
      r.sectionName === `${sectionId}. ${sectionName}` || 
      r.sectionName === sectionName ||
      r.sectionName.includes(sectionName)
    );
  }, [revisionComments, sectionId, sectionName]);

  return {
    hasRevision,
    sectionName,
  };
}

