import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { QuizClientLayout } from "./_components/QuizClientLayout";

interface QuizLayoutProps {
  children: ReactNode;
}

export default async function QuizLayout({ children }: QuizLayoutProps) {
  const session = await validateSession();

  if (!session.valid) {
    redirect("/");
  }

  return (
    <QuizClientLayout
      initialEventId={session.user.event_id}
      initialUserId={session.user.id}
    >
      {children}
    </QuizClientLayout>
  );
}
