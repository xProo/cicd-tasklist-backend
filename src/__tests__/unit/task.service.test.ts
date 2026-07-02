import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@prisma/client";

vi.mock("../../lib/prisma.js", () => {
	return {
		default: {
			task: {
				findMany: vi.fn(),
				findUnique: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
			},
		},
	};
});

import prisma from "../../lib/prisma.js";
import * as taskService from "../../services/task.service.js";

const mockPrisma = vi.mocked(prisma);

const mockTask: Task = {
	id: 1,
	title: "Test Task",
	description: "A test task description",
	completed: false,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("TaskService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("findAll", () => {
		it("should return all tasks ordered by createdAt desc", async () => {
			const tasks = [mockTask];
			(mockPrisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(tasks);

			const result = await taskService.findAll();

			expect(result).toEqual(tasks);
			expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: "desc" },
			});
		});

		it("should return an empty array when no tasks exist", async () => {
			(mockPrisma.task.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

			const result = await taskService.findAll();

			expect(result).toEqual([]);
		});
	});

	describe("findById", () => {
		it("should return a task when it exists", async () => {
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTask);

			const result = await taskService.findById(1);

			expect(result).toEqual(mockTask);
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
				where: { id: 1 },
			});
		});

		it("should return null when task does not exist", async () => {
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

			const result = await taskService.findById(999);

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should create a task with title and description", async () => {
			const input = { title: "New Task", description: "Description" };
			(mockPrisma.task.create as ReturnType<typeof vi.fn>).mockResolvedValue({
				...mockTask,
				...input,
			});

			const result = await taskService.create(input);

			expect(result.title).toBe("New Task");
			expect(mockPrisma.task.create).toHaveBeenCalledWith({
				data: {
					title: "New Task",
					description: "Description",
				},
			});
		});

		it("should create a task with title only", async () => {
			const input = { title: "Task sans description" };
			(mockPrisma.task.create as ReturnType<typeof vi.fn>).mockResolvedValue({
				...mockTask,
				title: input.title,
				description: null,
			});

			const result = await taskService.create(input);

			expect(result.title).toBe("Task sans description");
			expect(mockPrisma.task.create).toHaveBeenCalledWith({
				data: {
					title: "Task sans description",
					description: undefined,
				},
			});
		});
	});

	describe("update", () => {
		it("should update an existing task", async () => {
			const updatedTask = { ...mockTask, title: "Updated", completed: true };
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTask);
			(mockPrisma.task.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedTask);

			const result = await taskService.update(1, { title: "Updated", completed: true });

			expect(result).toEqual(updatedTask);
			expect(mockPrisma.task.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { title: "Updated", completed: true },
			});
		});

		it("should throw when task does not exist", async () => {
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

			await expect(taskService.update(999, { title: "Updated" })).rejects.toThrow(
				"Task not found"
			);
			expect(mockPrisma.task.update).not.toHaveBeenCalled();
		});
	});

	describe("remove", () => {
		it("should delete an existing task", async () => {
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTask);
			(mockPrisma.task.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockTask);

			const result = await taskService.remove(1);

			expect(result).toEqual(mockTask);
			expect(mockPrisma.task.delete).toHaveBeenCalledWith({
				where: { id: 1 },
			});
		});

		it("should throw when task does not exist", async () => {
			(mockPrisma.task.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

			await expect(taskService.remove(999)).rejects.toThrow("Task not found");
			expect(mockPrisma.task.delete).not.toHaveBeenCalled();
		});
	});
});
