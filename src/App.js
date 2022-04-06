import React from "react";
import { Container, Nav } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/Wallet";
import Cover from "./components/minter/Cover";
import Nfts from "./components/minter/nfts";
import { useBalance, useMinterContract, useMarketContract } from "./hooks";
import "./App.css";


const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { balance, getBalance } = useBalance();
  const minterContract = useMinterContract();
  const marketContract = useMarketContract()

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>
            <Nfts
              name="Dripto Ponks"
              updateBalance={getBalance}
              minterContract={minterContract}
              marketContract = {marketContract}
            />
          </main>
        </Container>
      ) : (
        <Cover name="Dripto Ponks" coverImg={"https://cdn.vox-cdn.com/thumbor/NdyRZRTw9ml6vb_JgxQlhbjNqFE=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/22506332/cryptopunks_9_punks_larva_labs_nfts_at_christies_new_rvs_0409.jpg"} connect={connect} />
      )}
    </>
  );
};

export default App;