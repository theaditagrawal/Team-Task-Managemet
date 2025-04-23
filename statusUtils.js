export const projectStatuses = [
  'Not Started',
  'In Progress',
  'Under Review',
  'Completed'
];

export const getStatusColor = (status) => {
  switch (status) {
    case 'Not Started':
      return 'default'; // Grey
    case 'In Progress':
      return 'warning'; // Orange
    case 'Under Review':
      return 'info'; // Blue
    case 'Completed':
      return 'success'; // Green
    default:
      return 'default';
  }
}; 