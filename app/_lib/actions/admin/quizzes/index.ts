export { uploadQuizImage } from './uploadQuizImage';
export { getQuizzes } from './getQuizzes';
export type { QuizRecord, QuizWithChoices, ChoiceRecord } from './getQuizzes';
export { createQuiz } from './createQuiz';
export { updateQuiz } from './updateQuiz';
export { deleteQuiz } from './deleteQuiz';
export { reorderQuizzes } from './reorderQuizzes';

export type {
  CreateQuizInput,
  UpdateQuizInput,
  DeleteQuizInput,
  ReorderQuizzesInput,
  GetQuizzesInput,
  UploadQuizImageInput,
  QuizFormInput,
  ChoiceInput,
} from './validation';
