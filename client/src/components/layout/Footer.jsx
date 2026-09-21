import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SkillDesk</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect with top freelancers and get your projects done with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Browse Services</Link></li>
              <li><Link to="/freelancers" className="text-sm hover:text-white transition-colors">Find Freelancers</Link></li>
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Post a Project</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Freelancers</h3>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Become a Freelancer</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Explore Categories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><span className="text-sm">About SkillDesk</span></li>
              <li><span className="text-sm">Privacy Policy</span></li>
              <li><span className="text-sm">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SkillDesk. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"><Github className="w-4 h-4" /></span>
            <span className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"><Twitter className="w-4 h-4" /></span>
            <span className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"><Linkedin className="w-4 h-4" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
