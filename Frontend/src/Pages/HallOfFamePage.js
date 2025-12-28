import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import "../CSS/hallOfFamePage.css";

const HEART_STORAGE_KEY = "hofHearts";

const readStoredHearts = () => {
    if (typeof window === "undefined") return {};
    try {
        const stored = window.localStorage.getItem(HEART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to read heart data", error);
        return {};
    }
};

const HOF = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hearts, setHearts] = useState(readStoredHearts);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:1760/api/hof/getTop", {
                    credentials: "include",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Failed to load Hall of Fame");
                }

                const data = await response.json();
                const topThree = (Array.isArray(data) ? data.slice(0, 3) : []).map((entry) => entry || null);

                const enriched = await Promise.all(
                    topThree.map(async (entry) => {
                        if (!entry) return null;
                        try {
                            const profileRes = await fetch(
                                `http://localhost:1760/api/users/${entry.userId}`,
                                { credentials: "include", signal: controller.signal }
                            );

                            if (!profileRes.ok) {
                                throw new Error("Profile lookup failed");
                            }

                            const user = await profileRes.json();
                            return { ...entry, user };
                        } catch (profileError) {
                            console.error(profileError);
                            return { ...entry, user: null };
                        }
                    })
                );

                if (!ignore) {
                    setTopUsers(enriched);
                    setHearts((prev) => {
                        const next = { ...prev };
                        enriched.forEach((entry) => {
                            if (entry?.userId && !next[entry.userId]) {
                                next[entry.userId] = { count: 0, liked: false };
                            }
                        });
                        return next;
                    });
                    setError("");
                }
            } catch (err) {
                if (!ignore && err.name !== "AbortError") {
                    setError(err.message || "Unable to load Hall of Fame.");
                    setTopUsers([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchLeaderboard();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(HEART_STORAGE_KEY, JSON.stringify(hearts));
        }
    }, [hearts]);

    const podiumRanks = [1, 2, 3];
    const podiumData = podiumRanks.map((rank, index) => topUsers[index] || null);

    const formatName = (user) => {
        if (!user) return "Awaiting Challenger";
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return fullName || user.email || "Community Member";
    };

    const getAvatar = (entry, fallbackName) => {
        const baseName = fallbackName || "Contributor";
        if (entry?.user?.photo) return entry.user.photo;
        const initials = encodeURIComponent(baseName);
        return `https://ui-avatars.com/api/?name=${initials}&background=0D8ABC&color=fff`;
    };

    const getHeartState = (userId) => {
        if (!userId) return { count: 0, liked: false };
        return hearts[userId] || { count: 0, liked: false };
    };

    const toggleHeart = (userId) => {
        if (!userId) return;
        setHearts((prev) => {
            const current = prev[userId] || { count: 0, liked: false };
            const liked = !current.liked;
            const count = Math.max(0, current.count + (liked ? 1 : -1));
            return { ...prev, [userId]: { count, liked } };
        });
    };

    return (
        <section className="hof-page">
            <h1 className="hof-title">Hall of Fame</h1>
            <p className="hof-subtitle">
                Celebrating the community legends who keep the knowledge flowing.
            </p>

            {error && <div className="hof-error">{error}</div>}

            <div className="hof-podium">
                {loading ? (
                    <div className="hof-loading">Loading leaderboard...</div>
                ) : (
                    podiumData.map((entry, index) => {
                        const rank = index + 1;
                        const name = formatName(entry?.user);
                        const avatar = getAvatar(entry, name);
                        const totalPosts = entry ? entry.discussion_thread + entry.discussion_comment : 0;
                        const impactScore = entry
                            ? Math.round(entry.discussion_thread * 2 + entry.review * 3 + entry.discussion_comment * 1.5)
                            : 0;
                        const { count: heartCount, liked } = getHeartState(entry?.userId);
                        return (
                            <div className={`hof-card hof-card--${rank}`} key={entry?.userId || `placeholder-${rank}`}>
                                <div className="hof-heart-row">
                                    <button
                                        type="button"
                                        className={`hof-heart ${liked ? "is-liked" : ""}`}
                                        onClick={() => toggleHeart(entry?.userId)}
                                        disabled={!entry}
                                        aria-pressed={liked}
                                        aria-label={entry ? `Applaud ${name}` : "Heart disabled"}
                                    >
                                        <FaHeart />
                                        <span>{heartCount}</span>
                                    </button>
                                </div>
                                <span className="hof-rank-label">
                                    {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                                </span>
                                <div className="hof-avatar">
                                    <img src={avatar} alt={`${name} avatar`} />
                                </div>
                                <p className="hof-name">{name}</p>
                                {entry ? (
                                    <>
                                        <div className="hof-mini-stats">
                                            <div>
                                                <span>Total Posts</span>
                                                <strong>{totalPosts}</strong>
                                            </div>
                                            <div>
                                                <span>Impact Score</span>
                                                <strong>{impactScore}</strong>
                                            </div>
                                        </div>
                                        <div className="hof-stats">
                                            <span>
                                                <strong>{entry.discussion_thread}</strong> threads
                                            </span>
                                            <span>
                                                <strong>{entry.review}</strong> reviews
                                            </span>
                                            <span>
                                                <strong>{entry.discussion_comment}</strong> comments
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="hof-placeholder">
                                        Be the next top contributor!
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default HOF;