import * as React from 'react';

import { DialogStyled } from '../../components/DialogStyled';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { SellerEscrow } from '../../../lib';
import { serializeSellOrder } from '../../../lib';

/******************************************************************************/
/* Guarantor Link Modal Component */
/******************************************************************************/

type GuarantorLinkModalProps = {
  open: boolean;
  onClose: () => void;
  sellerEscrow: SellerEscrow;
};

export function GuarantorLinkModal(props: GuarantorLinkModalProps) {
  const sellOrderData = serializeSellOrder(props.sellerEscrow.sellOrder);
  const urlSearchParams = new URLSearchParams({ sell: sellOrderData });
  const guaranteeURL =
    window.location.origin + '/#/guarantee/?' + urlSearchParams.toString();

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="simple-modal-title"
    >
      <DialogStyled>
        <DialogTitle id="simple-modal-title">Guarantor Link</DialogTitle>
        <DialogContent>
          <Typography variant="p" style={{ overflowWrap: 'break-word' }}>
            {guaranteeURL}
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
