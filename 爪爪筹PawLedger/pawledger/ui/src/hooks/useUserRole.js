import { useState, useEffect } from "react";
import { useWallet } from "./useWallet";
import { useContract } from "./useContract";

export function useUserRole() {
  const { account } = useWallet();
  const { pawLedger } = useContract();
  const [isReviewer, setIsReviewer] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0n);
  const [reviewerThreshold, setReviewerThreshold] = useState(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account || !pawLedger) {
      setIsReviewer(false);
      setTotalDonated(0n);
      return;
    }
    setLoading(true);
    Promise.all([
      pawLedger.isReviewer(account),
      pawLedger.totalDonated(account),
      pawLedger.reviewerThreshold(),
    ])
      .then(([rev, donated, threshold]) => {
        setIsReviewer(rev);
        setTotalDonated(donated);
        setReviewerThreshold(threshold);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [account, pawLedger]);

  return {
    isReviewer,
    isDonor: totalDonated > 0n,
    canBecomeReviewer: !isReviewer && reviewerThreshold > 0n && totalDonated >= reviewerThreshold,
    totalDonated,
    reviewerThreshold,
    loading,
  };
}
