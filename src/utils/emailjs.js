import emailjs from '@emailjs/browser'

// EmailJS Configuration - reads from environment variables
// In Vercel, set these as environment variables with VITE_ prefix
export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_jd0emjf', // Gmail service
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_7uicebm',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || null,
  PRIVATE_KEY: import.meta.env.VITE_EMAILJS_PRIVATE_KEY || null, // For future use if needed
}

/**
 * Initialize EmailJS with public key
 * Call this once in your app initialization
 */
export const initEmailJS = (publicKey) => {
  if (publicKey) {
    emailjs.init(publicKey)
  } else if (EMAILJS_CONFIG.PUBLIC_KEY) {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)
  }
}

/**
 * Send email using EmailJS
 * @param {Object} templateParams - Template parameters matching your EmailJS template
 * @returns {Promise} - EmailJS send promise
 */
export const sendEmail = async (templateParams) => {
  try {
    // Initialize EmailJS with public key from environment variables
    if (EMAILJS_CONFIG.PUBLIC_KEY) {
      initEmailJS(EMAILJS_CONFIG.PUBLIC_KEY)
    } else {
      console.warn('EmailJS Public Key not found. Make sure VITE_EMAILJS_PUBLIC_KEY is set in environment variables.')
    }
    
    console.log('Sending email with params:', templateParams)
    console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID)
    console.log('Template ID:', EMAILJS_CONFIG.TEMPLATE_ID)
    
    // Ensure all template params are strings (EmailJS requirement)
    const sanitizedParams = Object.entries(templateParams).reduce((acc, [key, value]) => {
      acc[key] = value !== null && value !== undefined ? String(value) : ''
      return acc
    }, {})
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      sanitizedParams
    )
    
    console.log('EmailJS Success:', response)
    return { success: true, response }
  } catch (error) {
    const errorDetails = {
      code: error?.code,
      text: error?.text,
      status: error?.status,
      message: error?.message,
      fullError: error
    }
    
    console.error('EmailJS Error Details:', errorDetails)
    
    // Provide user-friendly error messages
    let userMessage = 'Something went wrong. Please try again or contact us directly.'
    
    if (error?.text) {
      if (error.text.includes('Invalid') || error.text.includes('not found')) {
        userMessage = 'Email service configuration error. Please contact support.'
      } else if (error.text.includes('rate limit') || error.text.includes('quota')) {
        userMessage = 'Too many requests. Please try again in a few moments.'
      } else {
        userMessage = error.text
      }
    } else if (error?.message) {
      userMessage = error.message
    }
    
    return { 
      success: false, 
      error: {
        message: userMessage,
        code: error?.code,
        status: error?.status,
        details: errorDetails
      }
    }
  }
}

/**
 * Format contact form data for EmailJS template
 * Based on the template configuration, it expects: name, title, email
 * The template is an auto-reply that sends TO the user's email
 * @param {Object} formData - Form data object
 * @returns {Object} - Formatted template parameters matching the template
 */
export const formatContactFormData = (formData) => {
  // Get the user's full name
  const fullName = formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
  
  // Get title/subject - this is what appears as {{title}} in the template
  const title = formData.subject || formData.service || 'Contact Form Submission'
  
  // Template expects: name, title, email
  // The template sends an auto-reply TO the user's email ({{email}})
  return {
    name: fullName,
    title: title,
    email: formData.email,
    
    // Include additional data for potential future use or logging
    // These won't break the template if it doesn't use them
    message: formData.message || '',
    phone: formData.phone || '',
    company: formData.company || '',
    service: formData.service || '',
  }
}

