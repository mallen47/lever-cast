/**
 * Template service
 *
 * Re-exports the API client functions for backward compatibility.
 * New code should import directly from '@/lib/services/api/templates'.
 */

export {
	fetchTemplates as getTemplates,
	fetchTemplate as getTemplateById,
	createTemplate,
	updateTemplate,
	deleteTemplate,
} from './api/templates';
