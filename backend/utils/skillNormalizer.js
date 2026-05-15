const normalizeSkill = (skill) => {
  if (!skill) return '';
  const s = skill.toString().trim().toLowerCase();
  
  // Dictionary of common aliases mapping to standard formats
  const aliases = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'html': 'HTML',
    'html5': 'HTML',
    'css': 'CSS',
    'css3': 'CSS',
    'react': 'React',
    'reactjs': 'React',
    'react.js': 'React',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'angular': 'Angular',
    'angularjs': 'Angular',
    'py': 'Python',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'cpp': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'php': 'PHP',
    'aws': 'AWS',
    'gcp': 'GCP',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'docker': 'Docker',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'git': 'Git',
    'github': 'GitHub',
    'ui': 'UI Design',
    'ux': 'UX Design',
    'ui/ux': 'UI/UX Design',
    'ml': 'Machine Learning',
    'ai': 'Artificial Intelligence',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'django': 'Django',
    'flask': 'Flask',
    'spring': 'Spring Boot',
    'springboot': 'Spring Boot',
    'ruby': 'Ruby',
    'rails': 'Ruby on Rails',
    'rubyonrails': 'Ruby on Rails'
  };

  // Return mapped alias or Title Case the skill if no alias is found
  if (aliases[s]) {
    return aliases[s];
  }

  // Capitalize first letter of each word
  return skill.trim().replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeSkillsArray = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return [];
  const normalized = skillsArray.map(normalizeSkill).filter(Boolean);
  return [...new Set(normalized)]; // Remove duplicates
};

module.exports = {
  normalizeSkill,
  normalizeSkillsArray
};
