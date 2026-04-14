'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,application/pdf';

interface Props {
  studentId: string;
  onUploaded?: () => void;
}

export function ReceiptUploader({ studentId, onUploaded }: Props) {
  const qc = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('studentId', studentId);
      return api.post('/payments/upload-receipt', fd);
    },
    onSuccess: () => {
      toast('Чек загружен, статус: ожидает проверки');
      setFile(null);
      setPreview(null);
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['student-payments', studentId] });
      onUploaded?.();
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Не удалось загрузить файл', 'error');
    },
  });

  const onPick = useCallback((f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast('Файл больше 10 МБ', 'error');
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
      toast('Допустимы JPG, PNG или PDF', 'error');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
      <p className="mb-2 text-sm font-medium text-slate-800">Загрузить чек об оплате</p>
      <p className="mb-4 text-xs text-slate-500">JPG, PNG или PDF, до 10 МБ</p>

      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-6 transition-colors hover:bg-slate-50"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPick(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <Upload className="h-8 w-8 text-slate-400" />
        <span className="text-sm text-slate-600">Выберите файл или перетащите сюда</span>
        <input
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && (
        <div className="mt-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Превью" className="max-h-40 rounded-lg border border-slate-200" />
        </div>
      )}

      {file && !preview && <p className="mt-3 text-center text-sm text-slate-600">{file.name}</p>}

      {file && (
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" loading={uploadMutation.isPending} onClick={() => uploadMutation.mutate(file)}>
            Отправить на проверку
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
          >
            Сбросить
          </Button>
        </div>
      )}
    </div>
  );
}
