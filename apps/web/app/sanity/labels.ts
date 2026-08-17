// Display labels for the schema's constrained string fields. The Studio holds the
// same titles in its field options; these exist because the front end receives
// only the stored value ("fat-loss"), not the title ("Fat loss").

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}

export const FOCUS_LABELS: Record<string, string> = {
  'strength': 'Strength',
  'hypertrophy': 'Hypertrophy',
  'fat-loss': 'Fat loss',
  'endurance': 'Endurance',
  'mobility': 'Mobility',
  'foundations': 'Foundations'
}
