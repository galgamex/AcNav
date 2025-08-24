export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Copyright © {currentYear} ACGN导航
        </p>
      </div>
    </footer>
  );
}
