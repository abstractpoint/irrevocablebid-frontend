import * as React from 'react';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { DialogStyled } from '../../components/DialogStyled';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import * as ethers from 'ethers';

import { SellOrder, BuyOrder, serializeBuyOrder } from '../../../lib';
import { validateSellerEscrow, validateGuarantorEscrow } from '../../../lib';
import {
  GuarantorEscrow,
  GuarantorEscrowState,
  GuarantorEscrowContractInfo,
  GuarantorEscrowOfferInfo,
  GuarantorEscrowBidInfo,
  GuarantorEscrowSettlementInfo,
} from '../../../lib';
import { AssetKind } from '../../../lib';

import {
  EthereumContext,
  formatExpirationTime,
  decodeSellOrder,
  decodeBuyOrder,
} from '../../helpers';
import { TokenAmount } from '../../components/TokenAmount';
import { EthereumAddress } from '../../components/EthereumAddress';
import {
  EthereumTransaction,
  EthereumTransactionStatus,
} from '../../components/EthereumTransaction';

/******************************************************************************/
/* Show Bid Modal Component */
/******************************************************************************/

type ShowBidModalProps = {
  open: boolean;
  onClose: () => void;
  guarantorEscrow: GuarantorEscrow;
};

export function ShowBidModal(props: ShowBidModalProps) {
  const buyOrderData = serializeBuyOrder(props.guarantorEscrow.buyOrder);

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="simple-modal-title"
    >
      <DialogStyled>
        <DialogTitle id="simple-modal-title">Guaranteed Bid</DialogTitle>
        <DialogContent>
          <Typography variant="p" style={{ overflowWrap: 'break-word' }}>
            {buyOrderData}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="text"
            size="small"
            onClick={props.onClose}
          >
            Close
          </Button>
        </DialogActions>
      </DialogStyled>
    </Dialog>
  );
}
