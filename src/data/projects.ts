export interface CloudinaryImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  detailContent: string;
  tags: string[];
  link: string;
  github?: string;
  image?: CloudinaryImage | null;
  images?: CloudinaryImage[];
  featured: boolean;
  isDeleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
  role?: string;
  period?: string;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI 블로그 에디터",
    description: "AI를 사용하여 글의 초안을 작성하고 최적화해주는 지능형 웹 에디터입니다.",
    detailContent: `### 프로젝트 개요
이 프로젝트는 현대적인 블로거들을 위한 지능형 글쓰기 도구입니다. 복잡한 아이디어를 구조화된 글로 바꾸는 과정을 AI가 돕습니다.

### 주요 기능
- **자동 초안 생성**: 제목과 키워드만으로 전체 글의 구조를 제안합니다.
- **SEO 최적화**: 작성된 글의 키워드 밀도와 구조를 분석하여 검색 엔진에 최적화합니다.
- **스타일 변환**: 격식 있는 말투부터 친근한 말투까지 버튼 하나로 문체를 변경합니다.

### 기술적 도전
OpenAI의 스트리밍 API를 활용하여 실시간으로 글이 작성되는 UI를 구현했으며, 드래그 앤 드롭 방식의 블록 에디터를 결합했습니다.`,
    tags: ["Next.js", "OpenAI", "Tailwind CSS"],
    link: "#",
    github: "https://github.com",
    featured: true,
  },
  {
    id: "2",
    title: "3D 포트폴리오 쇼케이스",
    description: "Three.js를 활용하여 개발자의 결과물을 입체적으로 보여주는 대화형 포트폴리오 사이트입니다.",
    detailContent: `### 프로젝트 개요
평면적인 웹사이트를 넘어 가상 공간에서 프로젝트를 탐험하는 듯한 경험을 제공합니다.

### 주요 기능
- **인터랙티브 룸**: 사용자가 마우스로 3D 공간을 회전하며 프로젝트 카드를 확인합니다.
- **동적 조명 시스템**: 시간대나 마우스 위치에 따라 공간의 조명이 실시간으로 변합니다.
- **반응형 3D**: 모바일 기기의 가속도계를 활용하여 기기 기울기에 따라 시점이 변합니다.

### 기술적 도전
웹 브라우저의 성능 한계를 극복하기 위해 셰이더(Shader) 최적화에 집중했으며, 끊김 없는 애니메이션을 위해 Framer Motion과 Three.js의 생명주기를 통합했습니다.`,
    tags: ["React", "Three.js", "Framer Motion"],
    link: "#",
    github: "https://github.com",
    featured: true,
  },
  {
    id: "3",
    title: "실시간 협업 도구",
    description: "여러 사용자가 동시에 문서를 편집하고 소통할 수 있는 실시간 생산성 플랫폼입니다.",
    detailContent: `### 프로젝트 개요
팀원들이 지리적 제약 없이 하나의 작업 공간에서 실시간으로 소통하며 결과물을 만들어냅니다.

### 주요 기능
- **동시 편집**: 여러 명의 커서가 실시간으로 보이며 텍스트를 수정합니다.
- **화상 회의 통합**: 별도의 앱 없이 브라우저 내에서 즉시 팀원과 대화합니다.
- **버전 히스토리**: 작업의 모든 변경 내역을 기록하고 언제든 이전 상태로 복구합니다.

### 기술적 도전
동시성 문제를 해결하기 위해 OT(Operational Transformation) 알고리즘을 도입했으며, 대용량 트래픽 상황에서도 안정적인 연결을 위해 Redis와 웹소켓 클러스터를 구축했습니다.`,
    tags: ["TypeScript", "Socket.io", "Express"],
    link: "#",
    featured: false,
  },
  {
    id: "4",
    title: "스마트 가계부 앱",
    description: "지출 내역을 자동으로 분류하고 시각화하여 개인의 소비 습관을 분석해주는 애플리케이션입니다.",
    detailContent: `### 프로젝트 개요
데이터를 통해 개인의 경제 활동을 이해하고 더 나은 금융 결정을 돕는 개인 자산 관리 도구입니다.

### 주요 기능
- **자동 카테고리화**: 결제 문자를 분석하여 식비, 교통비 등으로 자동 분류합니다.
- **소비 리포트**: 월별 소비 패턴을 D3.js 기반의 직관적인 차트로 시각화합니다.
- **예산 알림**: 설정한 예산의 일정 비율을 초과할 때 실시간 푸시 알림을 보냅니다.

### 기술적 도전
기기 내 저장소와 서버 동기화 사이의 데이터 일관성을 유지하는 오프라인 퍼스트(Offline-first) 구조를 설계했습니다.`,
    tags: ["React Native", "Firebase", "D3.js"],
    link: "#",
    featured: false,
  },
];

