/**
 * Utility functions for validating presentation data
 */

/**
 * Validates the structure and content of a presentation
 * @param {Object} presentation - The presentation data to validate
 * @throws {Error} If the presentation data is invalid
 */
function validatePresentation(presentation) {
  // Check if presentation exists
  if (!presentation) {
    throw new Error('Presentation data is required');
  }

  // Check title
  if (!presentation.title || typeof presentation.title !== 'string') {
    throw new Error('Presentation must have a valid title');
  }

  // Check slides array
  if (!presentation.slides || !Array.isArray(presentation.slides)) {
    throw new Error('Presentation must have an array of slides');
  }

  // Validate each slide
  presentation.slides.forEach((slide, index) => {
    if (!slide.title || typeof slide.title !== 'string') {
      throw new Error(`Slide ${index + 1} must have a valid title`);
    }

    if (!slide.content || typeof slide.content !== 'string') {
      throw new Error(`Slide ${index + 1} must have valid content`);
    }

    // Optional fields validation
    if (slide.notes && typeof slide.notes !== 'string') {
      throw new Error(`Slide ${index + 1} notes must be a string`);
    }

    if (slide.type && typeof slide.type !== 'string') {
      throw new Error(`Slide ${index + 1} type must be a string`);
    }

    if (slide.keywords && !Array.isArray(slide.keywords)) {
      throw new Error(`Slide ${index + 1} keywords must be an array`);
    }
  });

  return true;
}

/**
 * Validates the presentation options
 * @param {Object} options - The options to validate
 * @throws {Error} If the options are invalid
 */
function validatePresentationOptions(options) {
  if (!options) {
    throw new Error('Presentation options are required');
  }

  const validStyles = ['professional', 'creative', 'minimal', 'academic', 'nature', 'tech'];
  const validLanguages = ['vi', 'en'];
  const validPurposes = ['education', 'marketing', 'academic', 'business'];
  const validAudiences = ['general', 'executives', 'technical', 'students'];

  if (options.style && !validStyles.includes(options.style)) {
    throw new Error(`Invalid style. Must be one of: ${validStyles.join(', ')}`);
  }

  if (options.language && !validLanguages.includes(options.language)) {
    throw new Error(`Invalid language. Must be one of: ${validLanguages.join(', ')}`);
  }

  if (options.purpose && !validPurposes.includes(options.purpose)) {
    throw new Error(`Invalid purpose. Must be one of: ${validPurposes.join(', ')}`);
  }

  if (options.audience && !validAudiences.includes(options.audience)) {
    throw new Error(`Invalid audience. Must be one of: ${validAudiences.join(', ')}`);
  }

  if (options.slides && (typeof options.slides !== 'number' || options.slides < 1 || options.slides > 20)) {
    throw new Error('Number of slides must be between 1 and 20');
  }

  return true;
}

module.exports = {
  validatePresentation,
  validatePresentationOptions
}; 