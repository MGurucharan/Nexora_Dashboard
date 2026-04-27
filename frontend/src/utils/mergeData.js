function normalizeTeamName(value) {
  return String(value || "").trim().toLowerCase();
}

export function mergeData(registrations, payments) {
  const paymentByTeam = new Map(
    payments.map((payment) => [
      normalizeTeamName(payment["Team Name"]),
      payment,
    ])
  );

  return registrations.map((team) => {
    const payment = paymentByTeam.get(normalizeTeamName(team["Team Name"])) || null;

    return {
      ...team,
      paymentStatus: payment?.paymentStatus ?? payment?.["Payment Status"] ?? "Not Paid",
      txnId: payment?.txnId ?? payment?.["Txn ID"] ?? "N/A",
    };
  });
}