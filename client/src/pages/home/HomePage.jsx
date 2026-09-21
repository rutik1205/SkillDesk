import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceAPI, categoryAPI } from '../../services/api';
import ServiceCard from '../../components/services/ServiceCard';
import {
  Search, ArrowRight, Shield, Zap, DollarSign, MessageCircle,
  Star, Users, CheckCircle, Globe, Smartphone, Palette, PenTool,
  TrendingUp, Video, Music, Cpu, Briefcase
} from 'lucide-react';

const iconMap = {
  Globe, Smartphone, Palette, PenTool, TrendingUp, Video, Music, Cpu, Briefcase
};

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featRes, catRes] = await Promise.all([
        serviceAPI.getFeatured(),
        categoryAPI.getCategories(),
      ]);
      setFeatured(featRes.data.data.services);
      setCategories(catRes.data.data.categories);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/services?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-accent-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMzZ2LTJoMzR2Mkgyem0wLTEwdi0yaDM0djJIMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Find the right <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">talent</span> for your next project
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              SkillDesk connects you with top freelancers worldwide. From web development to design, find expert help for any project.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What service are you looking for?"
                  className="w-full pl-12 pr-4 py-4 rounded-l-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <button type="submit" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-r-xl transition-colors whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="text-primary-200">Popular:</span>
              {['Web Development', 'Logo Design', 'SEO', 'Mobile App'].map((tag) => (
                <Link
                  key={tag}
                  to={`/services?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="relative max-w-4xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '500+', label: 'Active Freelancers' },
              { value: '10k+', label: 'Projects Completed' },
              { value: '98%', label: 'Client Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm text-primary-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular Categories</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Explore services across a wide range of professional categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Briefcase;
              return (
                <Link
                  key={cat._id}
                  to={`/services?category=${cat._id}`}
                  className="group p-5 bg-gray-50 hover:bg-primary-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center mb-3 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500">{cat.serviceCount || 0} services</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Services</h2>
                <p className="text-gray-500">Handpicked services from our top freelancers</p>
              </div>
              <Link to="/services" className="hidden md:flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/services" className="btn-primary">
                Browse All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why SkillDesk */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why SkillDesk?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to get work done, all in one place</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Verified Talent', desc: 'Every freelancer is vetted for quality and professionalism' },
              { icon: DollarSign, title: 'Transparent Pricing', desc: 'No hidden fees. Know the cost upfront before you hire' },
              { icon: Zap, title: 'Fast Delivery', desc: 'Get your projects done on time with reliable freelancers' },
              { icon: MessageCircle, title: 'Direct Communication', desc: 'Chat directly with freelancers throughout your project' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-600 flex items-center justify-center mb-4 transition-colors">
                  <item.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Search', desc: 'Browse thousands of services or search for exactly what you need' },
              { step: '02', title: 'Choose', desc: 'Compare freelancers, read reviews, and pick the best fit' },
              { step: '03', title: 'Hire', desc: 'Place your order and communicate directly with your freelancer' },
              { step: '04', title: 'Receive', desc: 'Get your completed work delivered on time and leave a review' },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-primary-100 mb-8">Join thousands of professionals using SkillDesk</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
            <Link to="/services" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
