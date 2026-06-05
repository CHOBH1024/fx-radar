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
  },
  {
    title: '달러 강세·약세 사이클을 읽는 법 — 환율 예측을 위한 미 연준 독해술',
    category: '환율 분석',
    content: '달러 인덱스(DXY)는 유로, 엔화, 파운드 등 주요 6개국 통화 대비 미국 달러의 상대적 강도를 측정하는 지표로, 글로벌 환율 시장의 체온계 역할을 합니다. 달러 강세와 약세는 수많은 요인의 복합작용이지만, 가장 핵심적인 예측 변수는 미 연방준비제도(Fed)의 통화정책 방향성입니다. Fed가 금리 인상 사이클에 돌입하면 달러 예금의 금리 매력이 높아지면서 전 세계 자금이 달러 자산으로 유입되고 달러 강세가 나타납니다. 반대로 경기 침체나 고용 불안을 이유로 금리 인하 또는 양적완화(QE) 정책을 시행하면 달러 유동성이 시장에 넘쳐나며 약세 사이클이 시작됩니다. 연준 의장의 발언과 FOMC 의사록에는 향후 금리 경로에 대한 중요한 신호가 담겨 있습니다. "매파적(Hawkish)" 발언은 금리 인상 가능성을 시사하며 달러 강세 요인이고, "비둘기파적(Dovish)" 발언은 완화 기조를 의미하여 달러 약세 압력을 가합니다. 또한 미국의 비농업 고용지수(NFP), 소비자물가지수(CPI) 발표 직후에는 단기 환율 변동성이 급격히 확대되므로, 이 시점을 사전에 포착하고 포지션을 정밀 조정하는 환율 달력 관리가 FX 투자자에게 필수입니다. 달러 사이클을 이해하는 투자자는 단순히 환율을 따라가는 것이 아니라 사이클 앞에서 선제적으로 포지셔닝하여 수익 기회를 극대화할 수 있습니다.'
  },
  {
    title: '기술적 분석과 캔들스틱 차트의 심리학: 투자자 군중 심리의 해독',
    category: '트레이딩 심리',
    content: '외환 및 암호화폐 시장에서 기술적 분석(Technical Analysis)은 과거의 가격과 거래량 데이터를 바탕으로 미래의 흐름을 예측하는 기법입니다. 이 중 가장 널리 쓰이는 \'캔들스틱 차트(Candlestick Chart)\'는 단순한 가격 기록이 아니라, 시장 참여자들의 탐욕(Greed)과 공포(Fear)가 치열하게 부딪힌 결과물인 \'군중 심리\'의 시각적 표현입니다. 예를 들어, 긴 윗꼬리를 남긴 캔들은 상승 모멘텀이 강력한 매도세에 의해 제압당했음을 의미하며, 이는 시장의 추세 반전을 예고하는 강력한 심리적 신호로 작용합니다. 패턴을 읽는다는 것은 수학적 확률 게임을 넘어, 수많은 익명 투자자들의 패닉 셀링과 포모(FOMO) 현상을 한발 앞서 해독하는 메타인지 훈련입니다. 감정에 휘둘리지 않는 시스템 트레이딩을 구축하기 위해서는, 보조지표(RSI, MACD)와 결합하여 캔들 속에 숨겨진 심리적 저항선과 지지선을 냉철하게 파악하고 손절매(Stop-loss) 원칙을 기계적으로 지키는 규율이 반드시 필요합니다.'
  },
  {
    title: '디파이(DeFi) 생태계의 확장과 스마트 컨트랙트 리스크 관리 전략',
    category: '탈중앙화 금융',
    content: '탈중앙화 금융(DeFi, Decentralized Finance)은 전통적인 은행이나 중개 기관 없이 블록체인 상의 스마트 컨트랙트를 통해 대출, 예치, 스왑 등의 금융 서비스를 제공하는 혁신적 시스템입니다. 높은 이자율과 유동성 채굴(Liquidity Mining)의 매력 덕분에 막대한 글로벌 자본이 디파이 생태계로 유입되고 있습니다. 하지만 중앙 통제 기구가 없다는 점은 곧 모든 리스크를 투자자 개인이 온전히 짊어져야 함을 의미합니다. 스마트 컨트랙트의 코드 취약점을 노린 해킹이나, 담보 자산의 가치가 급락할 때 발생하는 연쇄 청산(Liquidation Spiral) 현상은 디파이 투자의 가장 치명적인 위험 요소입니다. 성공적인 디파이 자산 운용을 위해서는 프로토콜의 오딧(Audit, 보안 감사) 통과 여부를 꼼꼼히 확인하고, 단일 프로토콜에 자산을 집중시키지 않는 다각화 전략이 필수적입니다. 플랫폼의 토크노믹스와 구조를 깊이 이해하고 신뢰할 수 있는 인프라 위에서 안전하게 수익을 창출하는 방어망을 구축해야 합니다.'
  },
  {
    title: '중앙은행 디지털 화폐(CBDC)의 도입이 글로벌 환율 생태계에 미치는 파장',
    category: '미래 금융',
    content: '전 세계 주요 중앙은행들이 블록체인 기술을 활용한 법정 통화의 디지털 버전, 이른바 CBDC(Central Bank Digital Currency) 도입에 박차를 가하고 있습니다. 디지털 위안화, 디지털 유로화 등은 단순한 결제 편의성을 넘어 국가 간 송금 비용을 획기적으로 낮추고 글로벌 금융 패권을 재편할 잠재력을 지닙니다. 특히 SWIFT 시스템을 우회할 수 있는 국가 주도 디지털 화폐의 확산은 기축통화인 달러의 위상에 장기적인 도전을 제기합니다. 개인 외환 투자자 입장에서는 각국의 CBDC 발행 속도와 이에 따른 국제 자금 이체 속도의 변화, 규제 프레임워크의 도입 과정을 면밀히 모니터링해야 합니다. 이는 기존 외환 딜링 스프레드의 축소는 물론, 법정 통화와 비트코인 등 민간 가상자산 간의 새로운 상관관계를 형성하는 결정적 변곡점이 될 것입니다.'
  },
  {
    title: '알고리즘 트레이딩과 퀀트 투자의 명암 — 기계가 지배하는 시장에서의 생존법',
    category: '퀀트 투자',
    content: '오늘날 월스트리트를 비롯한 글로벌 외환 및 암호화폐 시장의 거래량 절반 이상은 인간이 아닌 인공지능(AI)과 퀀트 알고리즘에 의해 발생합니다. 초단타 매매(HFT)와 고도화된 머신러닝 모델은 수십 가지 거시경제 지표와 시장 심리를 밀리초 단위로 분석하여 인간의 인지 능력을 초월하는 수익 창출 능력을 보여줍니다. 그러나 이러한 기계적 매매의 군집 현상은 \'플래시 크래시(Flash Crash)\'와 같은 순식간의 대폭락을 유발하는 시스템 리스크의 주범이기도 합니다. 일반 개인 투자자가 거대 알고리즘과 속도전으로 경쟁하는 것은 필패의 길입니다. 대신 퀀트 봇들이 잡아내지 못하는 장기적인 매크로 트렌드와 기업/국가의 내재적 가치 변화에 집중하고, 알고리즘이 만들어내는 단기적인 노이즈 역발상을 기회로 삼는 인간 고유의 융합적 메타인지 통찰력이 그 어느 때보다 중요해졌습니다.'
  },
  {
    title: '지정학적 리스크와 안전자산의 진화 — 금, 달러, 그리고 비트코인의 상관관계',
    category: '거시경제',
    content: '전쟁, 전염병, 그리고 무역 분쟁과 같은 지정학적 위기(Geopolitical Risk)가 발발할 때마다 글로벌 자금은 본능적으로 안전자산으로 피난처를 찾습니다. 전통적으로 이 역할을 수행해 온 것은 금(Gold)과 미국 달러(USD)였습니다. 그러나 2020년대 들어 비트코인이 \'디지털 금\'이라는 내러티브를 획득하면서 안전자산의 지형도에 거대한 지각 변동이 일어나고 있습니다. 위기 발생 초기에는 극도의 현금 선호 현상으로 달러가 급등하고 위험자산인 코인이 급락하지만, 이후 각국 중앙은행의 유동성 공급과 법정 화폐 가치 훼손 우려가 커지면 비트코인과 금이 동반 상승하는 디커플링(Decoupling) 현상이 관찰됩니다. 현대의 투자자는 이러한 지정학적 충격이 통화 가치에 미치는 타임라인을 이해하고, 실물 금의 안정성과 비트코인의 이동성을 결합한 하이브리드 포트폴리오를 구축하여 위기를 구조적 기회로 전환해야 합니다.'
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
