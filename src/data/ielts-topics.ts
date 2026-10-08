export interface IELTSTopic {
  id: string;
  taskType: 'task1' | 'task2';
  subType: string; // e.g. 'Bar Chart', 'Line Graph', 'Opinion / Agree-Disagree', 'Discussion', 'Letter'
  category: string; // e.g. 'Environment', 'Education', 'Technology', 'Society', 'Economy'
  title: string;
  prompt: string;
  instructions: string[];
  dataDescription?: string; // Task 1의 경우 데이터/상황 설명
  recommendedMinutes: number; // 20 or 40
  minWords: number; // 150 or 250
}

export const PRESET_TOPICS: IELTSTopic[] = [
  // --- Task 2: Agree / Disagree (Technology & AI) ---
  {
    id: 't2-tech-ai-01',
    taskType: 'task2',
    subType: 'Agree / Disagree',
    category: 'Technology',
    title: 'Artificial Intelligence and Employment',
    prompt: 'Some people believe that the development of artificial intelligence will bring more benefits to human society than disadvantages, while others argue that it poses severe threats to future employment. To what extent do you agree or disagree?',
    instructions: [
      'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      'Write at least 250 words.',
      'Recommended time: 40 minutes.'
    ],
    recommendedMinutes: 40,
    minWords: 250,
  },
  // --- Task 2: Discuss Both Views (Education) ---
  {
    id: 't2-edu-university-02',
    taskType: 'task2',
    subType: 'Discuss Both Views',
    category: 'Education',
    title: 'Purpose of Higher Education',
    prompt: 'Some people think that universities should focus on providing knowledge and skills related to specific careers. Others believe that the main function of a university should be to give access to higher education for its own sake, regardless of career paths. Discuss both views and give your own opinion.',
    instructions: [
      'Discuss both sides of the argument and present your clear perspective.',
      'Provide relevant examples and logical reasoning.',
      'Write at least 250 words.'
    ],
    recommendedMinutes: 40,
    minWords: 250,
  },
  // --- Task 2: Problem & Solution (Environment) ---
  {
    id: 't2-env-plastic-03',
    taskType: 'task2',
    subType: 'Problem & Solution',
    category: 'Environment',
    title: 'Plastic Waste and Ocean Pollution',
    prompt: 'The increasing amount of plastic waste polluting oceans and natural habitats is one of the most pressing environmental crises today. What are the main causes of this problem, and what practical solutions can governments and individuals implement?',
    instructions: [
      'Analyze the root causes of global plastic accumulation.',
      'Suggest actionable, realistic measures for both authorities and citizens.',
      'Write at least 250 words.'
    ],
    recommendedMinutes: 40,
    minWords: 250,
  },
  // --- Task 2: Advantages & Disadvantages (Remote Work) ---
  {
    id: 't2-work-remote-04',
    taskType: 'task2',
    subType: 'Advantages & Disadvantages',
    category: 'Society & Work',
    title: 'Remote Working and Telecommuting',
    prompt: 'More and more companies are allowing employees to work from home on a full-time or hybrid basis. Do the advantages of this trend outweigh the disadvantages for both employers and employees?',
    instructions: [
      'Weigh the benefits against the drawbacks for both parties.',
      'Conclude with a definitive stance on whether the advantages outweigh the disadvantages.',
      'Write at least 250 words.'
    ],
    recommendedMinutes: 40,
    minWords: 250,
  },
  // --- Task 2: Two-Part Question (Youth & Society) ---
  {
    id: 't2-soc-youth-05',
    taskType: 'task2',
    subType: 'Two-Part Question',
    category: 'Society',
    title: 'Consumerism and Fast Fashion',
    prompt: 'Young people in many countries spend a large portion of their disposable income on trendy clothing and fast fashion items. Why is this occurring? What impact does this trend have on individuals and the environment?',
    instructions: [
      'Directly address both questions in distinct paragraphs.',
      'Incorporate concrete examples to justify your reasoning.',
      'Write at least 250 words.'
    ],
    recommendedMinutes: 40,
    minWords: 250,
  },
  // --- Task 1: Academic - Line Graph ---
  {
    id: 't1-acad-renewable-01',
    taskType: 'task1',
    subType: 'Line Graph (Academic)',
    category: 'Energy & Environment',
    title: 'Renewable Energy Consumption (2000-2024)',
    prompt: 'The graph below shows the percentage of total electricity generated from renewable energy sources (Solar, Wind, Hydro, and Biomass) in four European countries between 2000 and 2024.',
    dataDescription: `Key Data Points:
- Country A (Germany): Started at 7% in 2000, surged steadily to 52% in 2024 (steepest rise from 2012 onwards).
- Country B (Spain): Started at 15% in 2000, rose with slight fluctuations to 44% in 2024.
- Country C (Norway): Consistently high due to hydropower, started at 92% in 2000 and plateaued around 96% in 2024.
- Country D (UK): Began lowest at 3% in 2000, accelerated after 2015 to reach 40% in 2024.
Main Trends: All four nations experienced upward trajectories; Germany and the UK demonstrated the most dramatic proportional expansions.`,
    instructions: [
      'Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'Write at least 150 words.',
      'Recommended time: 20 minutes.'
    ],
    recommendedMinutes: 20,
    minWords: 150,
  },
  // --- Task 1: Academic - Bar Chart ---
  {
    id: 't1-acad-transport-02',
    taskType: 'task1',
    subType: 'Bar Chart (Academic)',
    category: 'Urban Living',
    title: 'Daily Commute Methods in 3 Major Metropolises',
    prompt: 'The chart compares the modal share of daily commuting (Private Car, Public Metro/Bus, Cycling, Walking) among residents in London, Tokyo, and New York in 2023.',
    dataDescription: `Key Data Points:
- Tokyo: Public transit dominant at 65%, Walking 18%, Cycling 12%, Private car only 5%.
- London: Public transit 45%, Private car 30%, Walking 15%, Cycling 10%.
- New York: Private car highest among the three at 48%, Subway/Bus 38%, Walking 11%, Cycling 3%.
Overview: Public transit is the primary mode in Tokyo and London, while private automobiles remain the most prevalent choice in New York.`,
    instructions: [
      'Select and report key comparisons and overviews.',
      'Do not include personal opinions; report factual data only.',
      'Write at least 150 words.'
    ],
    recommendedMinutes: 20,
    minWords: 150,
  },
  // --- Task 1: General Training - Formal Letter ---
  {
    id: 't1-gt-letter-01',
    taskType: 'task1',
    subType: 'Formal Letter (General)',
    category: 'Workplace & Business',
    title: 'Letter to Request Flexible Working Hours',
    prompt: 'You want to request a change to your work schedule so that you can work flexible hours or work from home for part of the week. Write a formal letter to your department manager.',
    instructions: [
      'Explain your current schedule and reason for requesting changes.',
      'Detail how you propose to organize your new working hours.',
      'Explain how this arrangement will not negatively affect your team or productivity.',
      'Begin your letter with: "Dear Mr./Ms. [Manager\'s Name],"',
      'Write at least 150 words.'
    ],
    recommendedMinutes: 20,
    minWords: 150,
  }
];
