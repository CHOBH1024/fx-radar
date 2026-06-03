import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  title: string;
  category: string;
  content: string;
}

const columnsData: Column[] = [
  {
    title: '글로벌 외환 시장의 기초 — 환율 변동을 결정하는 3대 경제 지표',
    category: '거시경제',
    content: '외환 시장(Forex Market)은 세계에서 가장 거대하고 유동성이 풍부한 금융 시장으로, 국가 간 통화의 교환 비율인 환율은 각국의 경제 기초체력을 실시간으로 반영합니다. 환율 변동을 결정하는 수많은 요인 중 가장 영향력이 큰 3대 경제 지표는 바로 "기준금리(Interest Rates)", "인플레이션율(CPI)", 그리고 "국내총생산(GDP) 성장률"입니다. 미국 연방준비제도(Fed)를 필두로 각국 중앙은행의 통화정책 금리 결정은 외환의 자금 흐름을 바꾸는 결정적인 방아쇠가 됩니다. 일반적으로 특정 국가의 금리가 상승하면 더 높은 수익률을 쫓아 글로벌 자금이 유입되며 해당 통화 가치(예: 달러화)가 강세를 보입니다. 외환 투자자들은 이들 지표의 발표 일정을 메타인지적으로 면밀히 트래킹하고 거시적 현금 흐름을 선제 예측하여 리스크를 회복력 있게 방어해야 합니다.'
  },
  {
    title: '가상자산과 전통 금융의 융합 — 비트코인 반감기와 거시경제 흐름',
    category: '암호화폐',
    content: '가상자산(Cryptocurrency)은 전통적인 법정화폐(Fiat Currency) 시스템에 대안으로 등장한 분산 원장 기반의 디지털 자산입니다. 비트코인으로 대표되는 가상자산 시장의 주기적 공급 통제 메커니즘인 "반감기(Halving)"는 4년마다 신규 채굴 공급량을 절반으로 줄여 자산의 희소성을 물리적으로 증가시키는 이벤트입니다. 최근 비트코인 현물 ETF 승인 등으로 가상자산이 전통 금융 포트폴리오로 편입되면서, 코인의 시세 흐름은 단순히 투기적 심리에 의해서가 아니라 미국 국채 금리, 유동성 공급량(M2), 달러 인덱스 등 글로벌 거시경제 흐름과 강하게 동조화(coupling)되어 움직이고 있습니다. 디지털 금으로 평가받는 암호화폐의 고유한 가치 저장 속성과 기존 금융 시스템의 융합 현상을 이해하는 것은 21세기 디지털 자산 배분 전략의 필수 전제 조건입니다.'
  },
  {
    title: '변동성 극복을 위한 포트폴리오 다각화 및 자산 믹서 기법',
    category: '포트폴리오',
    content: '가상자산과 외환 시장은 극심한 변동성(Volatility)을 보이며, 이는 개인 투자자에게 큰 기회이자 동시에 심각한 리스크 요인이 됩니다. 리스크를 이성적으로 제어하고 안정적인 장기 수익률을 확보하기 위해 가장 유용한 기법은 "포트폴리오 다각화(Asset Diversification)"와 다차원 통화 믹서 계산입니다. 상관관계가 음(-)이거나 낮은 자산군, 예를 들어 대표적 위험자산인 비트코인과 안전자산인 미국 달러화, 그리고 금을 적절한 비율로 믹싱하여 분산 투자하는 기법이 필수적입니다. 자산군별 변동성 지표를 모니터링하여 주기적인 리밸런싱을 시행하고, 환율 변동에 따른 교차 연산 믹서 툴을 통해 현재 자산의 실질 원화(KRW) 및 달러(USD) 가치를 정확히 트래킹하는 행동은 시장의 소음 속에서 평정심을 유지하고 합리적인 자산 배분을 실현하는 든든한 방어선이 됩니다.'
  },
  {
    title: '실시간 데이터 시각화가 개인 투자자의 합리적 의사결정에 미치는 영향',
    category: '핀테크 UX',
    content: '금융 시장의 수많은 데이터 속에서 뇌가 인지 오류에 빠지지 않고 냉철한 이성을 발휘하려면, 실시간 데이터의 정교한 시각화(Visualization)와 메타인지적 설계가 필수입니다. 핀테크 UX 관점에서 가격 변동 추이를 실시간 Flicker 애니메이션으로 제공하거나, 변동률을 Recharts 레이더 차트 및 미니 트렌드 면적 차트(Area Chart)로 압축 가시화해 보여주는 기능은 개인 투자자가 시장의 찰나적 변동성에 매몰되지 않고 거시적 흐름을 넓게 조망할 수 있도록 돕습니다. 시각적 구조화가 잘 된 대시보드는 정보의 과부하로 인한 뇌정지와 뇌동매매를 예방해 주며, 가격 상승 및 하락의 경향성을 차분히 분석해 사전에 수립한 리스크 관리 규칙대로 유연하게 대처할 수 있는 심리적 안전판을 설계해 줍니다.'
  },
  {
    title: '핀테크 알고리즘의 발전과 리스크 관리 가드 레일 설계법',
    category: '핀테크 개발',
    content: '최근의 금융 거래는 고성능 알고리즘과 비동기 API 통신을 통해 밀리초 단위로 데이터를 처리하며 진화하고 있습니다. 그러나 공공 금융 API나 가상자산 시세 조회 API는 빈번한 트래픽 제한(Rate Limit)이나 네트워크 장애 리스크를 수반합니다. 시스템의 다운이나 먹통 현상을 방지하기 위해 핀테크 개발팀은 디바운스(Debounce) 쿨다운 타이머, API 호출 실패 대비 예외 가드(Schema Validation) 등의 견고한 가드레일을 설계해야 합니다. 장애 발생 시 사전에 보관된 안전 캐시 데이터로 백업 렌더링되게 우회 로직을 구성하는 기술적 조치는 핀테크 프로덕트의 신뢰도를 결정짓는 핵심 뼈대가 됩니다. 안정성이 확보된 시스템 아키텍처 위에서 비로소 개인은 안전하고 신속한 가상자산 믹싱 및 금융 의사결정을 누릴 수 있습니다.'
  }
];

export const AdsensePassSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-6 py-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <BookOpen className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-bold text-white tracking-wide">
          Knowledge Hub &amp; 전문가 칼럼
        </h2>
      </div>
      
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        본 시스템은 실시간 글로벌 환율 및 가상자산 시세 교차 분석을 제공하며, 
        아래 칼럼 섹션은 핀테크 리스크 관리 및 글로벌 거시경제 트렌드 파악을 위해 정기적으로 업데이트되는 지식 아카이브입니다.
      </p>

      <div className="space-y-4">
        {columnsData.map((column, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="rounded-xl border border-white/5 bg-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-white/5"
              >
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 mb-1.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300">
                    {column.category}
                  </span>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {column.title}
                  </h3>
                </div>
                <div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[800px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="p-5 text-sm text-gray-300 leading-relaxed font-light whitespace-pre-line">
                  {column.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
