import { motion } from 'motion/react';
import { 
  Building2, 
  Globe, 
  CreditCard, 
  Network, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CorporateEntity } from '../../types';

import NexusRelayEditor from './NexusRelayEditor';

interface Props {
  entities: CorporateEntity[];
}

export default function NexusView({ entities }: Props) {
  return (
    <div className="space-y-12 max-w-5xl">
       <NexusRelayEditor entities={entities} />
    </div>
  );
}
