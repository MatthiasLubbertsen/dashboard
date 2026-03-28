// copilot generated
const STATS_URL = "https://flavortown.nephthys.hackclub.com/api/stats_v2";

function getSlackIdFromRequest(req) {
	const envSlackId = String(process.env.SLACK_ID || "").trim();
	if (envSlackId) return envSlackId;

	if (req?.query?.slackId) return String(req.query.slackId).trim();

	const host = req?.headers?.host || "localhost";
	const url = new URL(req.url || "/", `http://${host}`);
	return (url.searchParams.get("slackId") || "").trim();
}

function filterSectionForSlackId(section, slackId) {
	if (!section || typeof section !== "object") return section;

	const leaderboard = Array.isArray(section.helpers_leaderboard)
		? section.helpers_leaderboard
		: null;

	if (!leaderboard) {
		return section;
	}

	const index = leaderboard.findIndex((entry) => entry?.slack_id === slackId);
	const helperEntry = index >= 0 ? leaderboard[index] : null;

	return {
		...section,
		helpers_leaderboard: helperEntry ? [helperEntry] : [],
		helper_position: index >= 0 ? index + 1 : null,
	};
}

module.exports = async function handler(req, res) {
	const slackId = getSlackIdFromRequest(req);

	if (!slackId) {
		res.status(400).json({
			error: "Missing Slack ID. Set SLACK_ID in .env or pass ?slackId=U12345678 as fallback.",
			example: "SLACK_ID=U12345678 or /api/helper_stats?slackId=U12345678",
		});
		return;
	}

	try {
		const response = await fetch(STATS_URL, {
			headers: { Accept: "application/json" },
		});

		if (!response.ok) {
			res.status(502).json({
				error: "Upstream stats API returned a non-OK response",
				status: response.status,
			});
			return;
		}

		const data = await response.json();
		const output = {};

		for (const [key, value] of Object.entries(data || {})) {
			output[key] = filterSectionForSlackId(value, slackId);
		}

		res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
		res.status(200).json(output);
	} catch (error) {
		res.status(500).json({
			error: "Failed to fetch or process stats",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};
