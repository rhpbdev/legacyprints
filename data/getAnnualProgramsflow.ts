import { db } from '@/db';
import { themesTable, memorialsTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, sql, sum } from 'drizzle-orm';
import 'server-only';

export async function getAnnualProgramsflow(year: number) {
	const { userId } = await auth();

	if (!userId) {
		return [];
	}

	const month = sql`EXTRACT(MONTH FROM ${memorialsTable.serviceDate})`;

	const cashflow = await db
		.select({
			month,
			totalIncome: sum(
				sql`CASE WHEN ${themesTable.type} = 'income' THEN ${memorialsTable.quantity} ELSE 0 END`
			),
			totalExpenses: sum(
				sql`CASE WHEN ${themesTable.type} = 'expense' THEN ${memorialsTable.quantity} ELSE 0 END`
			),
		})
		.from(memorialsTable)
		.leftJoin(themesTable, eq(memorialsTable.themeId, themesTable.id))
		.where(
			and(
				eq(memorialsTable.userId, userId),
				sql`EXTRACT(YEAR FROM ${memorialsTable.serviceDate}) = ${year}`
			)
		)
		.groupBy(month);

	const AnnualProgramsflow: {
		month: number;
		income: number;
		expenses: number;
	}[] = [];

	for (let i = 1; i <= 12; i++) {
		const monthlyCashflow = cashflow.find((cf) => Number(cf.month) === i);
		AnnualProgramsflow.push({
			month: i,
			income: Number(monthlyCashflow?.totalIncome ?? 0),
			expenses: Number(monthlyCashflow?.totalExpenses ?? 0),
		});
	}

	return AnnualProgramsflow;
}
