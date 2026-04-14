'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaymentSummary } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell, DataTableRow } from '@/components/ui/data-table';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { PaymentBanner } from '@/components/payments/PaymentBanner';
import { CreditCard, Wallet, Calendar, Info, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function StudentPaymentPage() {
  const { data: paymentRes, isLoading } = useQuery({
    queryKey: ['student-payment-page'],
    queryFn: () => api.get<ApiResponse<PaymentSummary>>('/payments/my').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка...</div>;
  }

  const payment = paymentRes?.data;
  const history = payment?.history || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Оплата обучения
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Информация о платежах и история транзакций
        </p>
      </div>

      <PaymentBanner 
        daysUntilPayment={payment?.currentMonth.daysUntilPayment ?? null} 
        status={payment?.currentMonth.status ?? 'UNPAID'} 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Текущий статус
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm">
              <span className="text-slate-500 font-medium">К оплате (мес):</span>
              <span className="text-xl font-black text-slate-900">{payment?.currentMonth.amount} сум</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Следующая дата оплаты:</span>
                <span className="font-bold text-slate-900">
                  {payment?.currentMonth.nextPaymentDate ? format(new Date(payment.currentMonth.nextPaymentDate), 'd MMMM', { locale: ru }) : 'Не указана'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Статус месяца:</span>
                <PaymentStatusBadge status={payment?.currentMonth.status || 'UNPAID'} />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Пожалуйста, производите оплату до указанной даты. После оплаты чек необходимо отправить администратору или загрузить через кабинет родителя.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Как оплатить?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                  Через платежные системы
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <span className="font-medium">Payme / Click / Apelsin</span>
                    <Badge variant="secondary">В поиске: MathCenter</Badge>
                  </div>
                  <p className="text-xs text-slate-500 p-2">
                    В поле "ID ученика" укажите ваш номер телефона или уточните у администратора.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</div>
                  Банковские реквизиты
                </h4>
                <div className="p-4 border rounded-xl bg-slate-50 text-xs font-mono space-y-2">
                  <p><span className="text-slate-400">Р/С:</span> 2020 8000 1054 2200 0001</p>
                  <p><span className="text-slate-400">БАНК:</span> ЧАКБ "Универсал банк"</p>
                  <p><span className="text-slate-400">МФО:</span> 01084</p>
                  <p><span className="text-slate-400">ИНН:</span> 308765432</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            История транзакций
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
                <DataTableHeaderCell>Комментарий</DataTableHeaderCell>
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
                    <DataTableRow key={item.id}>
                      <DataTableCell className="text-slate-500 font-medium">
                        {format(new Date(item.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </DataTableCell>
                      <DataTableCell className="font-bold text-slate-900">
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
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                          >
                            Посмотреть <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : '—'}
                      </DataTableCell>
                      <DataTableCell className="text-slate-500 italic">
                        {item.rejectReason || '—'}
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
