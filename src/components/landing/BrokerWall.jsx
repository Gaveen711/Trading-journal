import { SectionHead, TextLink } from '../PublicSite';
import { BROKER_COUNT, BROKER_ROWS, MT4_COUNT, MT5_COUNT } from './brokerWallData';
import './BrokerWall.css';

/* ————————————————————————————————————————————————————————————————
   Broker wall — "Syncs with the brokers you already use."

   Two rows of brand marks drift past in opposite directions, monochrome
   until the pointer rests on one. Every tile is derived from the sync
   catalog (brokerWallData.js), so the wall can never list a broker the
   product cannot connect. The second copy of each row exists only to
   close the loop and is hidden from assistive tech; under reduced
   motion it is dropped and the rows wrap into a static grid.
   ———————————————————————————————————————————————————————————————— */

/* The MetaTrader marks are 96px pinwheels; at badge size the "MT4" in
   their centre is unreadable, so the tiles carry the platform as mono text
   and the marks themselves sit in the legend below at a size that reads. */
const PLATFORMS = [
  { key: 'mt4', short: 'MT4', src: '/mt4.svg', label: 'MetaTrader 4' },
  { key: 'mt5', short: 'MT5', src: '/mt5.svg', label: 'MetaTrader 5' },
];

function Tile({ broker }) {
  return (
    <li className='xb-tile'>
      {broker.logo ? (
        <img
          className='xb-logo'
          src={broker.logo}
          alt=''
          width='22'
          height='22'
          loading='lazy'
          decoding='async'
          data-chip={broker.chip ? 'true' : undefined}
        />
      ) : (
        <span className='xb-logo xb-logo--blank' aria-hidden='true' />
      )}
      <span className='xb-name'>{broker.display}</span>
      <span className='xb-platforms'>
        {PLATFORMS.filter((platform) => broker[platform.key]).map((platform) => (
          <abbr key={platform.key} className='xb-badge' title={platform.label}>{platform.short}</abbr>
        ))}
      </span>
    </li>
  );
}

function Row({ brokers, reverse = false, index }) {
  return (
    <div className={reverse ? 'xb-row xb-row--reverse' : 'xb-row'}>
      <div className='xb-track'>
        <ul className='xb-set' aria-label={`Supported brokers, row ${index + 1}`}>
          {brokers.map((broker) => <Tile key={broker.name} broker={broker} />)}
        </ul>
        <ul className='xb-set' aria-hidden='true'>
          {brokers.map((broker) => <Tile key={broker.name} broker={broker} />)}
        </ul>
      </div>
    </div>
  );
}

export function BrokerWall() {
  return (
    <section className='xj-section xb' aria-labelledby='brokers-heading'>
      <div className='xj-shell'>
        <SectionHead
          id='brokers-heading'
          eyebrow='Broker sync'
          title={<>Syncs with the brokers you <em>already</em> use.</>}
          lede={`${BROKER_COUNT} brokers and prop firms on MetaTrader 4 and 5. Fills arrive on their own; you keep the reason.`}
        />
        <p className='xb-ask'>
          <TextLink to='/contact'>Ask for your broker</TextLink>
        </p>
      </div>

      <div className='xb-band xj-reveal'>
        {BROKER_ROWS.map((brokers, index) => (
          <Row key={index} index={index} brokers={brokers} reverse={index % 2 === 1} />
        ))}
      </div>

      <div className='xj-shell'>
        <p className='xb-legend xj-label'>
          <span><img src={PLATFORMS[0].src} alt='' width='18' height='18' loading='lazy' decoding='async' /> MetaTrader 4 · {MT4_COUNT} brokers</span>
          <span><img src={PLATFORMS[1].src} alt='' width='18' height='18' loading='lazy' decoding='async' /> MetaTrader 5 · {MT5_COUNT} brokers</span>
          <span>Demo and live servers</span>
        </p>
      </div>
    </section>
  );
}
