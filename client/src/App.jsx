import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Filter, Mail, Search, Star, UserRound } from 'lucide-react';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from './api.js';

const initialBooking = {
  customerName: '',
  email: '',
  phone: '',
  date: '',
  timeSlot: '',
  notes: ''
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function StatusPill({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      <span>{text}</span>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

export function App() {
  const [experts, setExperts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 6 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [booking, setBooking] = useState(initialBooking);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);
  const [listState, setListState] = useState({ loading: true, error: '' });
  const [detailState, setDetailState] = useState({ loading: false, error: '' });
  const [bookingsEmail, setBookingsEmail] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsState, setMyBookingsState] = useState({ loading: false, error: '' });

  useEffect(() => {
    const timeout = window.setTimeout(() => setPage(1), 250);
    return () => window.clearTimeout(timeout);
  }, [search, category]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExperts() {
      setListState({ loading: true, error: '' });
      try {
        const result = await api.getExperts({ page, limit: 6, search, category });
        if (controller.signal.aborted) return;
        setExperts(result.data);
        setCategories(result.categories);
        setPagination(result.pagination);

        const selectedStillVisible = result.data.some((expert) => expert._id === selectedExpertId);
        if (result.data.length === 0) {
          setSelectedExpertId('');
          setSelectedExpert(null);
        } else if (!selectedExpertId || !selectedStillVisible) {
          setSelectedExpertId(result.data[0]._id);
        }
      } catch (error) {
        if (!controller.signal.aborted) setListState({ loading: false, error: error.message });
        return;
      }
      setListState({ loading: false, error: '' });
    }

    loadExperts();
    return () => controller.abort();
  }, [page, search, category, selectedExpertId]);

  useEffect(() => {
    if (!selectedExpertId) {
      setSelectedExpert(null);
      return;
    }

    let ignore = false;

    async function loadExpert() {
      setDetailState({ loading: true, error: '' });
      setBookingMessage('');
      setBookingError('');
      try {
        const result = await api.getExpert(selectedExpertId);
        if (ignore) return;
        setSelectedExpert(result.data);
        const firstOpenSlot = findFirstOpenSlot(result.data.availableSlots);
        setBooking((current) => ({
          ...current,
          date: firstOpenSlot?.date || '',
          timeSlot: firstOpenSlot?.time || ''
        }));
      } catch (error) {
        if (!ignore) setDetailState({ loading: false, error: error.message });
        return;
      }
      setDetailState({ loading: false, error: '' });
    }

    loadExpert();
    return () => {
      ignore = true;
    };
  }, [selectedExpertId]);

  useEffect(() => {
    if (!selectedExpertId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('joinExpert', selectedExpertId);

    socket.on('slotBooked', (payload) => {
      if (payload.expertId !== selectedExpertId) return;
      setSelectedExpert((expert) => markSlotBooked(expert, payload.date, payload.timeSlot));
      setBooking((current) => {
        if (current.date === payload.date && current.timeSlot === payload.timeSlot) {
          return { ...current, timeSlot: '' };
        }
        return current;
      });
    });

    socket.on('bookingStatusUpdated', (payload) => {
      setMyBookings((bookings) => bookings.map((item) => (
        item._id === payload.bookingId ? { ...item, status: payload.status } : item
      )));
    });

    return () => {
      socket.emit('leaveExpert', selectedExpertId);
      socket.disconnect();
    };
  }, [selectedExpertId]);

  const selectedDateSlots = useMemo(() => {
    return selectedExpert?.availableSlots.find((group) => group.date === booking.date)?.slots || [];
  }, [booking.date, selectedExpert]);

  const hasOpenSlots = useMemo(() => {
    return selectedExpert?.availableSlots.some((group) => group.slots.some((slot) => !slot.booked)) || false;
  }, [selectedExpert]);

  function updateBookingField(field, value) {
    setBooking((current) => ({
      ...current,
      [field]: value,
      ...(field === 'date' ? { timeSlot: '' } : {})
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setBookingMessage('');
    setBookingError('');
    setBookingBusy(true);

    try {
      const result = await api.createBooking({
        expertId: selectedExpertId,
        ...booking
      });
      setBookingMessage(result.message);
      setSelectedExpert((expert) => markSlotBooked(expert, booking.date, booking.timeSlot));
      setBooking((current) => ({ ...initialBooking, email: current.email }));
    } catch (error) {
      setBookingError(error.details?.[0]?.message || error.message);
    } finally {
      setBookingBusy(false);
    }
  }

  async function loadMyBookings(event) {
    event.preventDefault();
    setMyBookingsState({ loading: true, error: '' });
    try {
      const result = await api.getBookings(bookingsEmail);
      setMyBookings(result.data);
      setMyBookingsState({ loading: false, error: '' });
    } catch (error) {
      setMyBookings([]);
      setMyBookingsState({ loading: false, error: error.message });
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <span className="eyebrow">Expert Sessions</span>
          <h1>Book a real-time consultation</h1>
        </div>
        <div className="live-indicator">
          <span />
          Live slot updates
        </div>
      </section>

      <section className="layout-grid">
        <aside className="expert-panel">
          <div className="panel-heading">
            <h2>Experts</h2>
            <span>{pagination.total} found</span>
          </div>

          <div className="filters">
            <label className="input-with-icon">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
              />
            </label>
            <label className="input-with-icon">
              <Filter size={17} />
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          {listState.loading && <div className="loading-list"><span /><span /><span /></div>}
          <ErrorBanner message={listState.error} />

          {!listState.loading && !listState.error && (
            experts.length === 0 ? (
              <EmptyState title="No experts found" text="Try a different search or category." />
            ) : (
              <div className="expert-list">
                {experts.map((expert) => (
                  <button
                    className={`expert-card ${expert._id === selectedExpertId ? 'active' : ''}`}
                    key={expert._id}
                    onClick={() => setSelectedExpertId(expert._id)}
                  >
                    <div className="avatar"><UserRound size={22} /></div>
                    <div>
                      <strong>{expert.name}</strong>
                      <span>{expert.category}</span>
                      <small>{expert.experience} yrs exp</small>
                    </div>
                    <p><Star size={15} fill="currentColor" /> {expert.rating}</p>
                  </button>
                ))}
              </div>
            )
          )}

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Prev</button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </aside>

        <section className="detail-panel">
          {detailState.loading && <div className="detail-loading">Loading expert details...</div>}
          <ErrorBanner message={detailState.error} />

          {!detailState.loading && selectedExpert && (
            <>
              <div className="expert-hero">
                <div>
                  <span>{selectedExpert.category}</span>
                  <h2>{selectedExpert.name}</h2>
                  <p>{selectedExpert.bio}</p>
                </div>
                <dl>
                  <div><dt>Experience</dt><dd>{selectedExpert.experience} years</dd></div>
                  <div><dt>Rating</dt><dd>{selectedExpert.rating}/5</dd></div>
                  <div><dt>Fee</dt><dd>{formatCurrency(selectedExpert.price)}</dd></div>
                </dl>
              </div>

              <div className="work-area">
                <section className="slot-section">
                  <div className="section-heading">
                    <h3>Available slots</h3>
                    <span><Clock size={16} /> Real-time</span>
                  </div>

                  {selectedExpert.availableSlots.map((group) => (
                    <div className="slot-group" key={group.date}>
                      <h4><CalendarDays size={17} /> {group.date}</h4>
                      <div className="slot-grid">
                        {group.slots.map((slot) => (
                          <button
                            key={`${group.date}-${slot.time}`}
                            disabled={slot.booked}
                            className={booking.date === group.date && booking.timeSlot === slot.time ? 'selected' : ''}
                            onClick={() => setBooking((current) => ({
                              ...current,
                              date: group.date,
                              timeSlot: slot.time
                            }))}
                          >
                            {slot.time}
                            {slot.booked && <span>Booked</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                <section className="booking-section">
                  <div className="section-heading">
                    <h3>Book session</h3>
                    {bookingMessage && <span className="success-inline"><CheckCircle2 size={16} /> Saved</span>}
                  </div>
                  <ErrorBanner message={bookingError} />
                  {bookingMessage && <div className="success-banner">{bookingMessage}</div>}
                  {!hasOpenSlots && <ErrorBanner message="All slots for this expert are booked." />}

                  <form onSubmit={submitBooking} className="booking-form">
                    <label>
                      Name
                      <input required minLength="2" value={booking.customerName} onChange={(event) => updateBookingField('customerName', event.target.value)} />
                    </label>
                    <label>
                      Email
                      <input required type="email" value={booking.email} onChange={(event) => updateBookingField('email', event.target.value)} />
                    </label>
                    <label>
                      Phone
                      <input required pattern="[0-9+\-\s()]{7,20}" value={booking.phone} onChange={(event) => updateBookingField('phone', event.target.value)} />
                    </label>
                    <label>
                      Date
                      <select required value={booking.date} onChange={(event) => updateBookingField('date', event.target.value)}>
                        <option value="">Choose date</option>
                        {selectedExpert.availableSlots.map((group) => (
                          <option key={group.date} value={group.date}>{group.date}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Time Slot
                      <select required value={booking.timeSlot} onChange={(event) => updateBookingField('timeSlot', event.target.value)}>
                        <option value="">Choose time</option>
                        {selectedDateSlots.map((slot) => (
                          <option key={slot.time} value={slot.time} disabled={slot.booked}>
                            {slot.time}{slot.booked ? ' - Booked' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="full-span">
                      Notes
                      <textarea maxLength="500" value={booking.notes} onChange={(event) => updateBookingField('notes', event.target.value)} />
                    </label>
                    <button className="primary-action" disabled={bookingBusy || !hasOpenSlots}>
                      {bookingBusy ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </form>
                </section>
              </div>
            </>
          )}
        </section>
      </section>

      <section className="my-bookings">
        <div className="section-heading">
          <h2>My Bookings</h2>
          <span><Mail size={16} /> Search by email</span>
        </div>
        <form onSubmit={loadMyBookings} className="booking-search">
          <input
            type="email"
            required
            value={bookingsEmail}
            onChange={(event) => setBookingsEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <button>Find Bookings</button>
        </form>
        <ErrorBanner message={myBookingsState.error} />
        {myBookingsState.loading && <div className="detail-loading">Loading bookings...</div>}
        {!myBookingsState.loading && myBookings.length > 0 && (
          <div className="booking-table">
            {myBookings.map((item) => (
              <article key={item._id}>
                <div>
                  <strong>{item.expert?.name}</strong>
                  <span>{item.expert?.category}</span>
                </div>
                <span>{item.date}</span>
                <span>{item.timeSlot}</span>
                <StatusPill status={item.status} />
              </article>
            ))}
          </div>
        )}
        {!myBookingsState.loading && !myBookingsState.error && bookingsEmail && myBookings.length === 0 && (
          <EmptyState title="No bookings yet" text="Bookings for this email will appear here." />
        )}
      </section>
    </main>
  );
}

function findFirstOpenSlot(groups = []) {
  for (const group of groups) {
    const slot = group.slots.find((item) => !item.booked);
    if (slot) return { date: group.date, time: slot.time };
  }
  return null;
}

function markSlotBooked(expert, date, timeSlot) {
  if (!expert) return expert;

  return {
    ...expert,
    availableSlots: expert.availableSlots.map((group) => {
      if (group.date !== date) return group;
      return {
        ...group,
        slots: group.slots.map((slot) => (
          slot.time === timeSlot ? { ...slot, booked: true } : slot
        ))
      };
    })
  };
}
