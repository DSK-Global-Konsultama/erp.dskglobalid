// Public entry for projects feature. Consumer outside features/projects must import from here.

export * from './pages';
export { projectApi } from './api/projectApi';
export { ProjectDetailHeaderBar } from './ui/detail/ProjectDetailHeaderBar';
export { ProjectsPagination } from './ui/management/ProjectsPagination';
export { ProjectStatusBadge } from './ui/shared/ProjectStatusBadge';
