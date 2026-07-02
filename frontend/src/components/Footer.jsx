import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-center py-8">
      <Link to="/admin" className="text-[10px] text-gray-300 hover:text-gray-500">
        Admin Access
      </Link>
    </footer>
  );
}
