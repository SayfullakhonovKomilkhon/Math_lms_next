'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Shield, Zap, Lock } from 'lucide-react';

export default function ParentAchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          Достижения ребенка
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Награды и академические успехи вашего ребенка в MathCenter
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AchievementCard 
          icon={<Star className="h-8 w-8 text-amber-500" />} 
          title="Первые шаги" 
          description="Ребенок успешно выполнил первое домашнее задание" 
          unlocked={true}
          date="12.03.2024"
        />
        <AchievementCard 
          icon={<Zap className="h-8 w-8 text-yellow-500" />} 
          title="Пунктуальность" 
          description="10 посещений подряд без опозданий" 
          unlocked={true}
          date="05.04.2024"
        />
        <AchievementCard 
          icon={<Shield className="h-8 w-8 text-blue-500" />} 
          title="Мастер тригонометрии" 
          description="Идеальный результат за контрольную работу" 
          unlocked={false}
        />
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-lg">
          <h2 className="text-2xl font-black">Система мотивации</h2>
          <p className="text-slate-300">
            Мы поощряем успехи наших учеников. За каждое достижение ребенок получает виртуальные баллы, которые в будущем можно будет обменять на полезные призы.
          </p>
        </div>
        <Lock className="absolute right-[-20px] bottom-[-20px] h-64 w-64 text-white/5 -rotate-12" />
      </div>
    </div>
  );
}

function AchievementCard({ icon, title, description, unlocked, date }: any) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${unlocked ? 'border-amber-200 shadow-md scale-100' : 'opacity-40 grayscale blur-[1px]'}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl ${unlocked ? 'bg-amber-50' : 'bg-slate-100'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 leading-snug">{description}</p>
            {date && <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mt-3">{date}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
