/**
 * Template service
 *
 * Wraps the API client functions and adds cache invalidation hooks.
 */

import { mutate } from 'swr';
import {
	fetchTemplates,
	fetchTemplate,
	createTemplate as createTemplateApi,
	updateTemplate as updateTemplateApi,
	deleteTemplate as deleteTemplateApi,
} from './api/templates';

export const TEMPLATES_SWR_KEY = 'templates';

export function getTemplates() {
	return fetchTemplates();
}

export function getTemplateById(id: string) {
	return fetchTemplate(id);
}

export async function createTemplate(data: Parameters<typeof createTemplateApi>[0]) {
	const result = await createTemplateApi(data);
	// Revalidate cached templates after mutation
	void mutate(TEMPLATES_SWR_KEY);
	return result;
}

export async function updateTemplate(
	id: string,
	data: Parameters<typeof updateTemplateApi>[1]
) {
	const result = await updateTemplateApi(id, data);
	// Revalidate cached templates after mutation
	void mutate(TEMPLATES_SWR_KEY);
	return result;
}

export async function deleteTemplate(id: string) {
	await deleteTemplateApi(id);
	// Revalidate cached templates after mutation
	void mutate(TEMPLATES_SWR_KEY);
}
