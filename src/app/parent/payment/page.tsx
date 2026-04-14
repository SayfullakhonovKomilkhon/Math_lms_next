'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaymentSummary, ParentProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell, DataTableRow } from '@/components/ui/data-table';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { PaymentBanner } from '@/components/payments/PaymentBanner';
import { CreditCard, Upload, Check, AlertCircle, ExternalLink, FileText, Info } from 'lucide-react';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/components/ui/toast';

export default function ParentPaymentPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileRes } = useQuery({
    queryKey: ['parent-profile'],
    queryFn: () => api.get<ApiResponse<ParentProfile>>('/parents/me').then(res => res.data),
  });

  const { data: paymentRes, isLoading } = useQuery({
    queryKey: ['parent-child-payment'],
    queryFn: () => api.get<ApiResponse<PaymentSummary>>('/parents/me/child/payments').then(res => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => 
      api.post('/parents/me/child/payments/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-child-payment'] });
      toast({ title: 'Успешно!', description: 'Чек загружен и отправлен на проверку.' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить чек.', variant: 'destructive' });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка...</div>;
  }

  const payment = paymentRes?.data;
  const history = payment?.history || [];
  const profile = profileRes?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Оплата обучения
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Управление платежами и загрузка чеков для: <span className="font-bold text-slate-900">{profile?.child.fullName}</span>
        </p>
      </div>

      <PaymentBanner 
        daysUntilPayment={payment?.currentMonth.daysUntilPayment ?? null} 
        status={payment?.currentMonth.status ?? 'UNPAID'} 
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Month Info */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <CreditCard className="h-4 w-4" />
              </span>
              Текущий месяц
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">К оплате</p>
              <p className="text-5xl font-black text-slate-900">{payment?.currentMonth.amount} сум</p>
              <p className="text-sm font-medium text-slate-500">
                Срок: {payment?.currentMonth.nextPaymentDate ? format(new Date(payment.currentMonth.nextPaymentDate), 'd MMMM yyyy', { locale: ru }) : 'Не указан'}
              </p>
            </div>
            
            <div className="flex justify-center flex-wrap gap-2">
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">MathCenter</Badge>
              <Badge className="bg-slate-50 text-slate-600 hover:bg-slate-50">Ученик: {profile?.child.fullName}</Badge>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Статус оплаты:</p>
                <PaymentStatusBadge status={payment?.currentMonth.status || 'UNPAID'} />
            </div>
          </CardContent>
        </Card>

        {/* Upload Receipt */}
        <Card className="shadow-sm border-2 border-dashed border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Загрузить чек об оплате
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2 pb-8 px-8 text-center">
            <div 
              className="w-full h-40 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all mb-4 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-10 w-10 text-blue-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2" />
                  <p className="text-sm font-bold text-slate-600">Нажмите для выбора файла</p>
                  <p className="text-xs text-slate-400">PNG, JPG или PDF до 5MB</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleFileChange} 
            />
            
            <button
               onClick={handleUpload}
               disabled={!file || uploadMutation.isPending}
               className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2
                 ${!file || uploadMutation.isPending 
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                   : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
                 }`}
            >
              {uploadMutation.isPending ? 'Загрузка...' : (
                <>
                  {file ? <Check className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  Отправить чек на проверку
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed max-w-xs">
                Загружая чек, вы подтверждаете факт оплаты обучения вашего ребенка за текущий расчетный период.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-slate-600" />
            История платежей
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <table className="w-full text-sm">
              <DataTableHead className="bg-slate-50/50">
                <DataTableHeaderCell>Дата</DataTableHeaderCell>
                <DataTableHeaderCell>Сумма</DataTableHeaderCell>
                <DataTableHeaderCell>Статус</DataTableHeaderCell>
                <DataTableHeaderCell>Чек</DataTableHeaderCell>
                <DataTableHeaderCell>Заметки</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {history.length === 0 ? (
                  <DataTableRow>
                    <DataTableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                      У вас пока нет истории платежей в системе
                    </DataTableCell>
                  </DataTableRow>
                ) : (
                  history.map((item) => (
                    <DataTableRow key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <DataTableCell className="text-slate-500 font-medium">
                        {format(new Date(item.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </DataTableCell>
                      <DataTableCell className="font-bold text-slate-900 text-base">
                        {item.amount} сум
                      </DataTableCell>
                      <DataTableCell>
                        <PaymentStatusBadge status={item.status} />
                      </DataTableCell>
                      <DataTableCell>
                        {item.receiptUrl ? (
                          <a 
                            href={item.receiptUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all inline-flex items-center"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : '—'}
                      </DataTableCell>
                      <DataTableCell className="text-slate-500 italic">
                        {item.rejectReason || (item.status === 'CONFIRMED' ? <span className="text-green-600 not-italic">Принято ✓</span> : '—')}
                      </DataTableCell>
                    </DataTableRow>
                  ))
                )}
              </tbody>
            </table>
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
    return <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${className}`}>{children}</div>
}
