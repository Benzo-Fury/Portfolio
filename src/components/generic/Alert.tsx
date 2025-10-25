import { ReactNode } from "react";

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

export type AlertProps = {
  variant: AlertVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
};

const variantStyles = {
  error: {
    container: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    icon: "text-red-600 dark:text-red-400",
    action: "text-red-700 hover:text-red-600 dark:text-red-300 dark:hover:text-red-200"
  },
  warning: {
    container: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    icon: "text-yellow-600 dark:text-yellow-400",
    action: "text-yellow-700 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-200"
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-400",
    action: "text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
  },
  success: {
    container: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
    icon: "text-green-600 dark:text-green-400",
    action: "text-green-700 hover:text-green-600 dark:text-green-300 dark:hover:text-green-200"
  }
};

const icons = {
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
};

export default function Alert({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  children
}: AlertProps) {
  const styles = variantStyles[variant];
  const icon = icons[variant];

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          {description && (
            <div className="mt-2 text-sm">
              <p>{description}</p>
            </div>
          )}
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
          {actionLabel && onAction && (
            <div className="mt-4">
              <button
                onClick={onAction}
                className={`text-sm font-medium underline hover:no-underline transition-all duration-200 ${styles.action}`}
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

