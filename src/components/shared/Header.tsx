import { WalletButton } from "@/solana/provider/solana-provider";

const Header = () => {
  return (
    <header className="w-full h-20 border-gray-600 border-b">
      <nav className="flex h-full justify-between items-center px-8 ">
        <div>
          <span className="text-xl font-semibold">Lottery Dapp</span>
        </div>
        <WalletButton />
      </nav>
    </header>
  );
}

export default Header;