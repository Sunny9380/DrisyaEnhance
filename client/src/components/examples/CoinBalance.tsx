import CoinBalance from '../CoinBalance'

export default function CoinBalanceExample() {
  return (
    <CoinBalance
      balance={2500}
      onAddCoins={() => console.log('Add coins clicked')}
    />
  )
}
