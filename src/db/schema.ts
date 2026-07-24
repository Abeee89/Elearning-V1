import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, unique } from 'drizzle-orm/pg-core';

// 1. users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'student' | 'teacher'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. classes
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  teacherId: uuid('teacher_id').notNull().references(() => users.id),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. class_enrollments
export const classEnrollments = pgTable('class_enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').notNull().references(() => classes.id),
  studentId: uuid('student_id').notNull().references(() => users.id),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.classId, t.studentId)
}));

// 4. chapters
export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  orderIndex: integer('order_index').notNull(),
});

// 5. subchapters
export const subchapters = pgTable('subchapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapterId: uuid('chapter_id').notNull().references(() => chapters.id),
  title: varchar('title', { length: 200 }).notNull(),
  orderIndex: integer('order_index').notNull(),
  contentType: varchar('content_type', { length: 20 }).notNull(), // 'pdf' | 'video' | 'text'
  contentUrl: varchar('content_url', { length: 500 }),
  contentBody: text('content_body'),
});

// 6. simulations
export const simulations = pgTable('simulations', {
  id: uuid('id').defaultRandom().primaryKey(),
  subchapterId: uuid('subchapter_id').references(() => subchapters.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  config: jsonb('config'),
});

// 7. assessments
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  subchapterId: uuid('subchapter_id').notNull().references(() => subchapters.id).unique(),
  title: varchar('title', { length: 150 }).notNull(),
  passingScore: integer('passing_score').notNull().default(70),
});

// 8. questions
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 30 }).notNull(), // 'multiple_choice' | 'true_false' | 'essay'
  options: jsonb('options'),
  correctAnswer: varchar('correct_answer', { length: 255 }).notNull(),
});

// 9. assessment_attempts
export const assessmentAttempts = pgTable('assessment_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id),
  score: integer('score'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// 10. attempt_answers
export const attemptAnswers = pgTable('attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttempts.id),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  studentAnswer: varchar('student_answer', { length: 255 }),
  isCorrect: boolean('is_correct').default(false).notNull(),
});

// 11. evaluations
export const evaluations = pgTable('evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  recommendations: text('recommendations'),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// 12. learning_progress
export const learningProgress = pgTable('learning_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  subchapterId: uuid('subchapter_id').notNull().references(() => subchapters.id),
  status: varchar('status', { length: 20 }).default('not_started').notNull(), // 'not_started' | 'in_progress' | 'completed'
  completedAt: timestamp('completed_at'),
}, (t) => ({
  unq: unique().on(t.studentId, t.subchapterId)
}));

// 13. chat_sessions
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  subchapterId: uuid('subchapter_id').references(() => subchapters.id),
  startedAt: timestamp('started_at').defaultNow().notNull(),
});

// 14. chat_messages
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  sender: varchar('sender', { length: 10 }).notNull(), // 'user' | 'ai'
  messageText: text('message_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
