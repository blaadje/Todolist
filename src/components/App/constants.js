export const FILTER_ALL = 'filter-all'
export const FILTER_TAG = 'filter-tag'
export const FILTER_STATUS_TODO = 'filter-status-todo'
export const FILTER_STATUS_COMPLETED = 'filter-status-completed'

export const SORT_ORDER = ['orderIndex', 'desc']
export const SORT_NAME = 'name'
export const SORT_DATE_ASC = ['date', 'asc']
export const SORT_DATE_DESC = ['date', 'desc']

export const SORT_BY = [
  { label: 'Priority', value: SORT_ORDER },
  { label: 'Name', value: SORT_NAME },
  { label: 'Ascending date', value: SORT_DATE_ASC },
  { label: 'Descending date', value: SORT_DATE_DESC },
]
