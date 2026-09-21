const OrderStatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-800' },
    accepted: { label: 'Accepted', classes: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', classes: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', classes: 'bg-purple-100 text-purple-800' },
    revision_requested: { label: 'Revision Requested', classes: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Completed', classes: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-800' },
    rejected: { label: 'Rejected', classes: 'bg-rose-100 text-rose-800' },
  };

  const { label, classes } = config[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`badge ${classes}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;
