import { useMemo } from "react";

// functional programming section

function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
): (a: A) => D;
function pipe<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
): (a: A) => E;
function pipe<A, B, C, D, E, F>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
): (a: A) => F;
function pipe(...fns: Array<(arg: unknown) => unknown>) {
  return (arg: unknown) => fns.reduce((acc, fn) => fn(acc), arg);
}

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

type PriorityMap = Record<Blockchain, number>;

const PRIORITY: PriorityMap = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface BalanceWithUSD extends FormattedWalletBalance {
  usdValue: number;
}

interface Props extends BoxProps {}

const filterBalancesAndPrioritize = (
  list: WalletBalance[],
  priorityMap: PriorityMap = PRIORITY,
): WalletBalance[] => {
  return list.filter((b) => {
    const priority = priorityMap[b.blockchain];
    if (priority > -99) {
      return b.amount > 0;
    }
    return false;
  });
};

const sortBalances = (
  list: WalletBalance[],
  priorityMap: PriorityMap = PRIORITY,
): WalletBalance[] => {
  return list.sort((lhs: WalletBalance, rhs: WalletBalance) => {
    const leftPriority = priorityMap[lhs.blockchain];
    const rightPriority = priorityMap[rhs.blockchain];
    if (leftPriority > rightPriority) {
      return -1;
    }
    if (rightPriority > leftPriority) {
      return 1;
    }
    return 0;
  });
};

const formatBalances = (list: WalletBalance[]): FormattedWalletBalance[] => {
  return list.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(2),
    };
  });
};

const addUsdValue =
  (prices: Record<string, number>) =>
  (list: FormattedWalletBalance[]): BalanceWithUSD[] =>
    list.map((balance) => ({
      ...balance,
      usdValue: prices[balance.currency] * balance.amount,
    }));

const renderWalletRows = (list: BalanceWithUSD[]) =>
  list.map((balance: BalanceWithUSD, index: number) => (
    <WalletRow
      className={classes.row}
      key={index + balance.blockchain + balance.currency}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

const WalletPage = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return pipe(
      filterBalancesAndPrioritize,
      sortBalances,
      formatBalances,
    )(balances);
  }, [balances]);

  const rows = useMemo(
    () => pipe(addUsdValue(prices), renderWalletRows)(formattedBalances),
    [formattedBalances, prices],
  );

  return <div {...rest}>{rows}</div>;
};
