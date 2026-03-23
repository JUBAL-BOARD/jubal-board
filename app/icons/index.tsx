import {
  ChevronDown,
  Search,
  Play,
  Network,
  Image,
  Headphones,
  Shirt,
  PenLine,
  Monitor,
  CalendarDays,
  Video,
  Scissors,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Wallet,
  Bell,
  User,
  Settings,
  LogOut,
  ListFilter,
  Star,
  BadgeCheck,
  TriangleAlert,
  ClipboardList,
  X,
  MessageCircle,
  UserCheck,
  UserSearch,
} from "lucide-react";

// General UI
export const ChevronDownIcon = ChevronDown;
export { ChevronDown };
export const SearchIcon = (props: any) => <Search size={18} stroke="white" {...props} />;
export const BlackSearchIcon = (props: any) => <Search size={18} stroke="black" {...props} />;
export const PlayIcon = (props: any) => <Play size={20} fill="white" stroke="white" {...props} />;
export const NetworkIcon = (props: any) => <Network size={48} stroke="#E2554F" {...props} />;

// Category Icons
export const ImageIcon = (props: any) => <Image size={40} stroke="#E85D3A" {...props} />;
export const HeadphonesIcon = (props: any) => <Headphones size={40} stroke="#E85D3A" {...props} />;
export const FashionIcon = (props: any) => <Shirt size={40} stroke="#E85D3A" {...props} />;
export const WritingIcon = (props: any) => <PenLine size={40} stroke="#E85D3A" {...props} />;
export const TechIcon = (props: any) => <Monitor size={40} stroke="#E85D3A" {...props} />;
export const EventIcon = (props: any) => <CalendarDays size={40} stroke="#E85D3A" {...props} />;
export const VideoIcon = (props: any) => <Video size={40} stroke="#E85D3A" {...props} />;
export const CraftsIcon = (props: any) => <Scissors size={40} stroke="#E85D3A" {...props} />;
export const EducationIcon = (props: any) => <GraduationCap size={40} stroke="#E85D3A" {...props} />;
export const DressIcon = (props: any) => <Shirt size={40} stroke="#E85D3A" {...props} />;

// Contact Icons
export const MapPinIcon = (props: any) => <MapPin size={18} stroke="white" {...props} />;
export const PhoneIcon = (props: any) => <Phone size={18} stroke="white" {...props} />;
export const MailIcon = (props: any) => <Mail size={18} stroke="white" {...props} />;

// Social Icons
export const FacebookIcon = (props: any) => <Facebook size={20} {...props} />;
export const InstagramIcon = (props: any) => <Instagram size={20} {...props} />;
export const XIcon = (props: any) => <Twitter size={20} {...props} />;
export const YoutubeIcon = (props: any) => <Youtube size={20} {...props} />;

// Dashboard / Nav Icons
export const DashboardIcon = (props: any) => <LayoutDashboard size={18} {...props} />;
export const HireIcon = (props: any) => <UserSearch size={18} {...props} />;
export const DeskIcon = (props: any) => <Briefcase size={18} {...props} />;
export const MessagesIcon = (props: any) => <MessageSquare size={18} {...props} />;
export const WalletIcon = (props: any) => <Wallet size={18} {...props} />;
export const FavoritesIcon = (props: any) => <UserCheck size={18} {...props} />;
export const NotificationsIcon = (props: any) => <Bell size={18} {...props} />;
export const ProfileIcon = (props: any) => <User size={18} {...props} />;
export const SettingsIcon = (props: any) => <Settings size={18} {...props} />;
export const LogoutIcon = (props: any) => <LogOut size={18} {...props} />;
export const BellIcon = (props: any) => <Bell size={20} stroke="#374151" {...props} />;
export const GearIcon = (props: any) => <Settings size={20} stroke="#374151" {...props} />;
export const FilterIcon = (props: any) => <ListFilter size={16} stroke="#E85D3A" {...props} />;

// Misc
export const StarIcon = (props: any) => <Star size={13} fill="#F59E0B" stroke="#F59E0B" {...props} />;
export const VerifiedIcon = (props: any) => <BadgeCheck size={14} fill="#3B82F6" {...props} />;
export const AlertIcon = (props: any) => <TriangleAlert size={22} stroke="#E85D3A" {...props} />;
export const BriefcaseIcon = (props: any) => <Briefcase size={48} stroke="#e2554f" {...props} />;
export const ClipboardIcon = (props: any) => <ClipboardList size={48} stroke="#e2554f" {...props} />;
export const CloseIcon = (props: any) => <X size={16} stroke="black" {...props} />;
export const MessageCircleIcon = (props: any) => <MessageCircle size={18} stroke="#6B7280" {...props} />;

// Custom Logo — no lucide equivalent
export const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" stroke="#E85D3A" strokeWidth="2" />
    <circle cx="16" cy="10" r="4" fill="#E85D3A" />
    <circle cx="10" cy="22" r="3" fill="#2563EB" />
    <circle cx="22" cy="22" r="3" fill="#16A34A" />
    <line x1="16" y1="14" x2="10" y2="19" stroke="#6B7280" strokeWidth="1.5" />
    <line x1="16" y1="14" x2="22" y2="19" stroke="#6B7280" strokeWidth="1.5" />
  </svg>
);