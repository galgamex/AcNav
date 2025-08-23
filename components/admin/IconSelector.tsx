'use client'

import React, { useState } from 'react'
import {
  Home,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Heart,
  Music,
  Camera,
  Gamepad2,
  Car,
  Plane,
  Coffee,
  Book,
  Code,
  Palette,
  Dumbbell,
  Stethoscope,
  Building,
  Globe,
  Smartphone,
  Laptop,
  Settings,
  Star,
  Users,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Search,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Layout,
  Sidebar,
  Maximize,
  Minimize,
  RefreshCw,
  Power,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Headphones,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  File,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Tag,
  Bookmark,
  Flag,
  Pin,
  Paperclip,
  Link,
  ExternalLink,
  Zap,
  Flame,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Umbrella,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Mountain,
  Trees,
  Flower,
  Leaf,
  Bug,
  Fish,
  Bird,
  Dog,
  Cat,
  Rabbit,
  Turtle,
  Worm,
  Snail,
  Shell,
  Feather,
  Egg,
  Bone,
  Footprints,
  Clover,
  Sprout,
  TreePine,
  TreeDeciduous,
  Apple,
  Cherry,
  Grape,
  Banana,
  Pizza,
  Wine,
  Beer,
  Coffee as CoffeeIcon,
  Utensils,
  UtensilsCrossed,
  ChefHat,
  ShoppingCart,
  CreditCard,
  Wallet,
  Coins,
  Banknote,
  Receipt,
  Calculator,
  Scale,
  Ruler,
  Scissors,
  Pen,
  Pencil,
  Magnet,
  Compass,
  Map,
  Telescope,
  Microscope,
  Beaker,
  TestTube,
  Dna,
  Atom,
  Pill,
  Syringe,
  Bandage,
  Ambulance,
  Hospital,
  Cross,
  Glasses,
  Watch,
  Crown,
  Backpack,
  Key,
  Bed,
  Table,
  Lamp,
  Lightbulb,
  Fan,
  Refrigerator,
  Microwave,
  WashingMachine,
  Brush,
  Hammer,
  Wrench,
  Drill,
  Paintbrush,
  Cog,
  Plug,
  Cable,
  Antenna,
  Satellite,
  Radio,
  Monitor,
  Tablet,
  Speaker,
  Projector,
  Keyboard,
  Mouse,
  Joystick,
  Gamepad,
  Rocket,
  Diamond,
  Medal,
  Trophy,
  Award,
  Ribbon,
  School,
  University,
  Library,
  Timer,
  Bell,
  Guitar,
  Piano,
  Theater
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// 分类图标配置
const CATEGORY_ICONS = [
  { name: 'Home', icon: Home, label: '首页' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: '购物' },
  { name: 'Briefcase', icon: Briefcase, label: '商务' },
  { name: 'GraduationCap', icon: GraduationCap, label: '教育' },
  { name: 'Heart', icon: Heart, label: '生活' },
  { name: 'Music', icon: Music, label: '音乐' },
  { name: 'Camera', icon: Camera, label: '摄影' },
  { name: 'Gamepad2', icon: Gamepad2, label: '游戏' },
  { name: 'Car', icon: Car, label: '汽车' },
  { name: 'Plane', icon: Plane, label: '旅行' },
  { name: 'Coffee', icon: Coffee, label: '美食' },
  { name: 'Book', icon: Book, label: '阅读' },
  { name: 'Code', icon: Code, label: '编程' },
  { name: 'Palette', icon: Palette, label: '设计' },
  { name: 'Dumbbell', icon: Dumbbell, label: '健身' },
  { name: 'Stethoscope', icon: Stethoscope, label: '医疗' },
  { name: 'Building', icon: Building, label: '建筑' },
  { name: 'Globe', icon: Globe, label: '全球' },
  { name: 'Smartphone', icon: Smartphone, label: '手机' },
  { name: 'Laptop', icon: Laptop, label: '电脑' },
  { name: 'Settings', icon: Settings, label: '设置' },
  { name: 'Star', icon: Star, label: '收藏' },
  { name: 'Users', icon: Users, label: '社交' },
  { name: 'MessageCircle', icon: MessageCircle, label: '聊天' },
  { name: 'Mail', icon: Mail, label: '邮件' },
  { name: 'Calendar', icon: Calendar, label: '日历' },
  { name: 'Clock', icon: Clock, label: '时间' },
  { name: 'MapPin', icon: MapPin, label: '地图' },
  { name: 'Search', icon: Search, label: '搜索' },
  { name: 'Shield', icon: Shield, label: '安全' },
  { name: 'Zap', icon: Zap, label: '电力' },
  { name: 'Flame', icon: Flame, label: '热门' },
  { name: 'Sun', icon: Sun, label: '天气' },
  { name: 'Moon', icon: Moon, label: '夜间' },
  { name: 'Cloud', icon: Cloud, label: '云端' },
  { name: 'Mountain', icon: Mountain, label: '自然' },
  { name: 'Trees', icon: Trees, label: '环境' },
  { name: 'Flower', icon: Flower, label: '花卉' },
  { name: 'Apple', icon: Apple, label: '水果' },
  { name: 'Pizza', icon: Pizza, label: '食物' },
  { name: 'Wine', icon: Wine, label: '饮品' },
  { name: 'Utensils', icon: Utensils, label: '餐具' },
  { name: 'ShoppingCart', icon: ShoppingCart, label: '购物车' },
  { name: 'CreditCard', icon: CreditCard, label: '支付' },
  { name: 'Wallet', icon: Wallet, label: '钱包' },
  { name: 'Calculator', icon: Calculator, label: '计算' },
  { name: 'Pen', icon: Pen, label: '写作' },
  { name: 'Scissors', icon: Scissors, label: '工具' },
  { name: 'Hammer', icon: Hammer, label: '维修' },
  { name: 'Paintbrush', icon: Paintbrush, label: '绘画' },
  { name: 'Lightbulb', icon: Lightbulb, label: '创意' },
  { name: 'Trophy', icon: Trophy, label: '奖励' },
  { name: 'Medal', icon: Medal, label: '成就' },
  { name: 'Flag', icon: Flag, label: '标记' },
  { name: 'Tag', icon: Tag, label: '标签' },
  { name: 'Bookmark', icon: Bookmark, label: '书签' },
  { name: 'Link', icon: Link, label: '链接' },
  { name: 'Archive', icon: Archive, label: '归档' },
  { name: 'Package', icon: Package, label: '包装' },
  { name: 'File', icon: File, label: '文件' },
  { name: 'Folder', icon: Folder, label: '文件夹' },
  { name: 'Image', icon: Image, label: '图片' },
  { name: 'Video', icon: Video, label: '视频' },
  { name: 'Headphones', icon: Headphones, label: '音频' },
  { name: 'Radio', icon: Radio, label: '广播' },
  { name: 'Monitor', icon: Monitor, label: '显示器' },
  { name: 'Tablet', icon: Tablet, label: '平板' },
  { name: 'Watch', icon: Watch, label: '手表' },
  { name: 'Glasses', icon: Glasses, label: '眼镜' },
  { name: 'Key', icon: Key, label: '钥匙' },
  { name: 'Lock', icon: Lock, label: '锁定' },
  { name: 'Unlock', icon: Unlock, label: '解锁' },
  { name: 'Eye', icon: Eye, label: '查看' },
  { name: 'EyeOff', icon: EyeOff, label: '隐藏' },
  { name: 'CheckCircle', icon: CheckCircle, label: '完成' },
  { name: 'XCircle', icon: XCircle, label: '错误' },
  { name: 'AlertCircle', icon: AlertCircle, label: '警告' },
  { name: 'Info', icon: Info, label: '信息' },
  { name: 'HelpCircle', icon: HelpCircle, label: '帮助' }
]

interface IconSelectorProps {
  value?: string
  onChange: (iconName: string) => void
  className?: string
}

export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredIcons = CATEGORY_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedIcon = CATEGORY_ICONS.find(icon => icon.name === value)

  const handleIconSelect = (iconName: string) => {
    onChange(iconName)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedIcon ? (
            <div className="flex items-center gap-2">
              <selectedIcon.icon className="h-4 w-4" />
              <span>{selectedIcon.label}</span>
            </div>
          ) : (
            <span>选择图标</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>选择图标</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="搜索图标..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto scrollbar-hide">
            {filteredIcons.map((icon) => {
              const IconComponent = icon.icon
              return (
                <Button
                  key={icon.name}
                  variant={value === icon.name ? "default" : "outline"}
                  size="sm"
                  className="h-12 w-12 p-0 flex flex-col items-center justify-center"
                  onClick={() => handleIconSelect(icon.name)}
                  title={icon.label}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              )
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              未找到匹配的图标
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IconSelector