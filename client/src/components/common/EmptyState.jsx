import { PackageOpen } from 'lucide-react';

const EmptyState = ({ icon: Icon = PackageOpen, title = 'Nothing here yet', message = '', action = null }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{message}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
