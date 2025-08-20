'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  ExternalLink, 
  Mail,
  Calendar,
  Tag,
  Globe,
  FileText,
  Folder
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: number;
  name: string;
  url: string;
  description: string;
  tags: string | null;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    adminNote: ''
  });
  const [isReviewing, setIsReviewing] = useState(false);

  // 获取申请列表
  const fetchSubmissions = async (page = 1, status = statusFilter) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (status !== 'all') {
        params.append('status', status);
      }
      
      const response = await fetch(`/api/submissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      } else {
        toast.error('获取申请列表失败');
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
      toast.error('获取申请列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // 状态筛选变化
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchSubmissions(1, status);
  };

  // 分页变化
  const handlePageChange = (page: number) => {
    fetchSubmissions(page, statusFilter);
  };

  // 打开审核对话框
  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewData({
      status: submission.status,
      adminNote: submission.adminNote || ''
    });
    setIsDialogOpen(true);
  };

  // 提交审核
  const handleReview = async () => {
    if (!selectedSubmission || !reviewData.status) {
      toast.error('请选择审核状态');
      return;
    }

    setIsReviewing(true);
    
    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast.success('审核完成');
        setIsDialogOpen(false);
        fetchSubmissions(pagination.page, statusFilter);
      } else {
        const error = await response.json();
        toast.error(error.message || '审核失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    } finally {
      setIsReviewing(false);
    }
  };

  // 删除申请
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个申请吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('申请已删除');
        fetchSubmissions(pagination.page, statusFilter);
      } else {
        const error = await response.json();
        toast.error(error.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />待审核</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />已通过</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和筛选 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">收录申请管理</h1>
          <p className="text-gray-600 dark:text-gray-400">审核和管理用户提交的网站收录申请</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 申请列表 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
                暂无申请记录
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{submission.name}</CardTitle>
                        {getStatusBadge(submission.status)}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={submission.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {submission.url}
                          </a>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {submission.category.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog open={isDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openReviewDialog(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            审核
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>审核申请 - {selectedSubmission?.name}</DialogTitle>
                            <DialogDescription>
                              请仔细审核申请内容，选择合适的处理方式
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* 申请详情 */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    网站名称
                                  </Label>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    {selectedSubmission.name}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-1">
                                    <ExternalLink className="h-4 w-4" />
                                    网站URL
                                  </Label>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    <a 
                                      href={selectedSubmission.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {selectedSubmission.url}
                                    </a>
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-1">
                                    <Folder className="h-4 w-4" />
                                    分类
                                  </Label>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    {selectedSubmission.category.name}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    联系邮箱
                                  </Label>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    {selectedSubmission.contactEmail}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  网站描述
                                </Label>
                                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded leading-relaxed">
                                  {selectedSubmission.description}
                                </p>
                              </div>
                              
                              {selectedSubmission.tags && (
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    标签
                                  </Label>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    {selectedSubmission.tags}
                                  </p>
                                </div>
                              )}
                              
                              {/* 审核表单 */}
                              <div className="border-t pt-4 space-y-4">
                                <div className="space-y-2">
                                  <Label>审核状态</Label>
                                  <Select 
                                    value={reviewData.status} 
                                    onValueChange={(value) => setReviewData(prev => ({ ...prev, status: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="选择审核结果" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">待审核</SelectItem>
                                      <SelectItem value="approved">通过</SelectItem>
                                      <SelectItem value="rejected">拒绝</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>管理员备注</Label>
                                  <Textarea
                                    placeholder="请输入审核备注（可选）"
                                    value={reviewData.adminNote}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, adminNote: e.target.value }))}
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isReviewing}
                                  >
                                    取消
                                  </Button>
                                  <Button 
                                    onClick={handleReview}
                                    disabled={isReviewing || !reviewData.status}
                                  >
                                    {isReviewing ? '处理中...' : '确认审核'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {submission.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {submission.contactEmail}
                      </span>
                      
                      {submission.tags && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {submission.tags}
                        </span>
                      )}
                      
                      {submission.adminNote && (
                        <span className="text-blue-600 dark:text-blue-400">
                          备注: {submission.adminNote}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            上一页
          </Button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}