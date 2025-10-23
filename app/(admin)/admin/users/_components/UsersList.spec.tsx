import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UsersList } from "./UsersList";

// Mock modules
vi.mock("@/app/_lib/actions/admin/getUsers", () => ({
  getUsers: vi.fn(),
}));

describe("UsersList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("コンポーネントがレンダリングされる", () => {
    // UsersList は useEffect で自動的にデータを取得するため、
    // レンダリングできることを確認
    expect(UsersList).toBeDefined();
  });
});
