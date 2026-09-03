import { useState, useEffect, useCallback, useRef } from 'react';

export function useAutoSave(draftKey, formData, isFormSubmitted = false) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const isFirstRender = useRef(true);

  // Check if a saved draft exists on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && Object.keys(parsed.data).length > 0) {
          setHasDraft(true);
          setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
        }
      }
    } catch (e) {
      console.error('Failed to read draft from localStorage', e);
    }
  }, [draftKey]);

  // Debounced auto-save when form data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isFormSubmitted) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        // Only save if some meaningful field has been typed
        const hasContent = Object.values(formData).some(
          v => v !== null && v !== undefined && v !== '' && v !== false
        );

        if (hasContent) {
          const payload = {
            data: formData,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(draftKey, JSON.stringify(payload));
          setLastSaved(new Date());
        }
      } catch (e) {
        console.error('Failed to save draft to localStorage', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [draftKey, formData, isFormSubmitted]);

  // Load draft function
  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
    return null;
  }, [draftKey]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      setLastSaved(null);
    } catch (e) {
      console.error('Failed to clear draft', e);
    }
  }, [draftKey]);

  return {
    hasDraft,
    loadDraft,
    clearDraft,
    lastSaved
  };
}
