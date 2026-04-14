'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Shield, Zap, Lock } from 'lucide-react';

export default function StudentAchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          Достижения
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Ваши академические успехи и награды
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AchievementCard 
          icon={<Star className="h-8 w-8 text-amber-500" />} 
          title="Первые шаги" 
          description="Выполнил первое домашнее задание без ошибок" 
          unlocked={true}
          date="12.03.2024"
        />
        <AchievementCard 
          icon={<Zap className="h-8 w-8 text-yellow-500" />} 
          title="Стрела" 
          description="Посетил 10 уроков подряд без опозданий" 
          unlocked={true}
          date="05.04.2024"
        />
        <AchievementCard 
          icon={<Shield className="h-8 w-8 text-blue-500" />} 
          title="Мастер тригонометрии" 
          description="Получил 100% за контрольную по тригонометрии" 
          unlocked={false}
        />
        <AchievementCard 
          icon={<Trophy className="h-8 w-8 text-purple-500" />} 
          title="Топ месяца" 
          description="Занял 1-е место в рейтинге группы" 
          unlocked={false}
        />
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 overflow-hidden relative">
        <div className="relative z-10 space-y-4 max-w-lg">
          <h2 className="text-2xl font-black">Скоро: Система баллов</h2>
          <p className="text-slate-300">
            Мы работаем над системой лояльности, где вы сможете обменивать заработанные в учебе баллы на призы и мерч MathCenter!
          </p>
        </div>
        <Lock className="absolute right-[-20px] bottom-[-20px] h-64 w-64 text-white/5 -rotate-12" />
      </div>
    </div>
  );
}

function AchievementCard({ icon, title, description, unlocked, date }: any) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${unlocked ? 'border-amber-200 shadow-md scale-100 hover:scale-[1.02]' : 'opacity-40 grayscale blur-[1px]'}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl ${unlocked ? 'bg-amber-50' : 'bg-slate-100'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title} {unlocked && '✓'}</h3>
            <p className="text-sm text-slate-500 mt-1 leading-snug">{description}</p>
            {date && <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mt-3">{date}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
