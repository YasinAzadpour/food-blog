const AdminPage = () => {
  const [mainChart, setMainChart] = useState(null);
  const [adminData, setAdminData] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [data, setData] = useContext(Context).data;

  const updateChart = (newData) => {
    mainChart.config.data.datasets[0].data = newData.data;
    mainChart.config.data.labels = newData.labels;
    mainChart.update();
  };

  
const AnOrder = () => {
  const [data, setData] = useContext(Context).data;
  const [order, setOrder] = useState({});

  const getOrder = () => {
    
    $.ajax({
      method: "POST",
      url: `/api/admin/orders/${orderId}`,
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        
        if (r.result) {
          setOrder({ ...r.cart, ["isReady"]: true });
        }
      },
      error: () => {
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(getOrder, 10000);
      },
    });
  };

  useEffect(() => {
    getOrder();
  }, [1]);

  const Mcard = ({ food }) => {
    return (
      <div className="relative p-2 bg-white shadow-lg flex-col overflow-hidden rounded-xl m-2 card flex h-min">
        <div
          className={`w-full top-0 right-0 blur-2xl absolute h-full bg-[url(${food.image})] bg-center bg-cover brightness-75`}
        />
        <div className="z-[2] flex flex-col h-full justify-between text-xl">
          <h1 dir="auto" className="my-1 font-medium underline truncate">
            <Link to={`/foods/${food.slug}`}>{food.name}</Link>
          </h1>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>

            <span className="font-meduim">${food.price}</span>
          </div>
          <div className="number flex justify-center items-center w-full my-2">
            <span className="text-3xl text-center">{food.quantity}</span>
          </div>
        </div>
      </div>
    );
  };

  const deliver = (e) => {
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/api/cart/deliver",
      data: {
        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
        id: order.id,
      },
      success: (r) => {
        
        if (r.result) {
          setOrder({ ...order, ["delivered"]: true });
        }
      },
      error: () => {
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(deliver, 10000);
      },
    });
  };

  // useEffect(() => {
  //   let total = 0;
  //   data.cart.map((item) => (total += item.quantity * item.price));
  //   setTotalPrice(total);
  // }, [data.cart]);

  const closeSide = (e) => {
    if (e.target.id == "close") {
      $("body").removeClass("overflow-hidden");
      setOrderId(null);
      if (order.delivered){
        setAdminData({...adminData,['orders']: adminData.orders.filter((i)=>i.id != order.id) })
      }
    }
  };
  return (
    <div
      id="close"
      onClick={closeSide}
      className={`bg-[#00000078] backdrop-blur-sm fixed w-screen h-screen right-0 top-0 flex flex-col-reverse sm:flex-row-reverse z-20 ${
        true ? "" : "opacity-0 pointer-events-none"
      }`}
    >
      {order.isReady ? (
        <div
          className={`${
            true
              ? "translate-0"
              : "translate-y-[100%] sm:translate-x-[100%] sm:translate-y-0"
          } overflow-auto transition-all border-2 border-gray-100 flex flex-col bg-white absolute rounded-tr-3xl rounded-tl-3xl w-full h-[95%] sm:rounded-tr-none sm:rounded-bl-3xl sm:h-full sm:w-[28rem]`}
        >
          <button
            id="close"
            className="p-2 w-full flex items-center justify-center sm:w-auto sm:h-full sm:left-0 sm:absolute"
          >
            <div className="rounded-full bg-gray-200 w-20 h-1 sm:h-20 sm:w-1"></div>
          </button>
          <div className="h-full overflow-auto">
            {order.items.map((item) => (
              <Mcard food={item} key={item.id} />
            ))}
          </div>
          <form onSubmit={deliver} className="flex flex-col m-4 lg:ml-4">
            <div className="w-full flex items-center m-2 mb-6  justify-start">
              <img
                src={order.user.profile}
                alt={`${order.user.name} profile image`}
                className="overflow-hidden rounded-[33%]  aspect-square w-16 min-w-16 h-16"
              />
              <div className="overflow-hidden ml-2">
                <h1 className="font-medium text-3xl truncate">{order.user.name}</h1>
                <span className="font-light text-base text-slate-600">
                  {order.user.phone}
                </span>
              </div>
            </div>
            <div className="my-2 text-xl flex">
              <span className="text-semibold">Address: </span>
              <span className="text-gray-800 text-lg ml-2">
                {order.address}
              </span>
            </div>
            <div className="flex justify-between items-start my-4 w-full text-xl">
              <span>Total Price:</span>
              <span className="text-gray-800">${order.price}</span>
            </div>
            <button
              type="submit"
              className={`py-4 px-8 w-full m-0 rounded-full text-white transition-all ${
                order.delivered ? "bg-gray-900" : "bg-green-700 active:scale-95"
              }`}
            >
              {order.delivered ? "Done" : "Deliver"}
            </button>
          </form>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};


  const getData = () => {
    $.ajax({
      method: "POST",
      url: "/api/admin",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        if (r.result) {
          setAdminData({ ...r, ["isReady"]: true });
        }
      },
      error: () => {
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(getData, 10000);
      },
    });
  };

  useEffect(() => {
    getData();
    getHomeData([data,setData]);
  }, [1]);

  useEffect(() => {
    manageChart();
  }, [adminData.isReady]);

  const manageChart = () => {
    if (adminData.income) {
      const ctx = document.getElementById("mainCanvas").getContext("2d");

      const myChart = new Chart(ctx, {
        type: "line",
        responsive: true,
        data: {
          labels: adminData.income.year.labels,
          datasets: [
            {
              label: ["Income"],
              fill: true,
              backgroundColor: "transparent",
              borderColor: "#c2efcc",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#38773c",
              pointBorderColor: "rgba(255,255,255,0)",
              // pointHoverBackgroundColor: "#5f4eff",
              //pointHoverBorderColor:'rgba(35,46,55,1)',
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 3,
              data: adminData.income.year.data,
            },
          ],
        },
        options: {
          // maintainAspectRatio: false,
          legend: {
            display: false,
          },

          tooltips: {
            backgroundColor: "#13131366",
            borderColor: "#fff",
            titleFontColor: "#fff",
            bodyFontColor: "#fff",
            bodySpacing: 4,
            xPadding: 22,
            yPadding: 10,
            mode: "nearest",
            intersect: 0,
            position: "nearest",
          },
          responsive: true,
          scales: {
            yAxes: [
              {
                barPercentage: 1.6,
                gridLines: {
                  drawBorder: false,
                  color: "rgba(0,0,0,0.0)",
                  zeroLineColor: "transparent",
                },
                ticks: {
                  display: false,
                  suggestedMin: 0,
                  suggestedMax: 350,
                  padding: 20,
                  fontColor: "#9aa9a",
                },
              },
            ],

            xAxes: [
              {
                barPercentage: 1.6,
                gridLines: {
                  drawBorder: false,
                  color: "rgba(0,0,0,0)",
                  zeroLineColor: "transparent",
                },
                ticks: {
                  padding: 20,
                  fontColor: "#131313",
                },
              },
            ],
          },
        },
      });

      setMainChart(myChart);
    }
  };

  return (
    <main className="flex w-full flex-col items-center mt-20 px-4 sm:px-8">
      {adminData.isReady ? (
        <div className="container grid grid-cols-1 container my-8 items-center max-w-[90rem] justify-center">
          <div className="flex h-full justify-between">
            <h1 className="my-2 text-2xl">Income Chart</h1>
            <div className="flex h-min">
              <button
                onClick={() => updateChart(adminData.income.weak)}
                className="py-1 px-2 rounded-bl-lg rounded-tl-lg bg-green-200 text-green-600 hover:bg-green-700 hover:text-white active:scale-95 transition-all"
              >
                W<span className="none sm:inline">eak</span>
              </button>
              <button
                onClick={() => updateChart(adminData.income.month)}
                className="py-React.createContext()1 px-2 bg-green-200 text-green-600 hover:bg-green-700 hover:text-white active:scale-95 transition-all"
              >
                M<span className="none sm:inline">onth</span>
              </button>
              <button
                onClick={() => updateChart(adminData.income.year)}
                className="py-1 px-2 rounded-br-lg rounded-tr-lg bg-green-200 text-green-600 hover:bg-green-700 hover:text-white active:scale-95 transition-all"
              >
                Y<span className="none sm:inline">ear</span>
              </button>
            </div>
          </div>
          <div>
            <canvas id="mainCanvas"></canvas>
          </div>
        </div>
      ) : (
        ""
      )}
      {adminData.isReady ? (
        <div className="container grid grid-cols-1 max-w-[90rem]">
          <div className="container flex flex-col my-4 xl:ml-3">
            <div className="flex justify-between text-xl items-center">
              <h1 className="text-xl font-semibold">
                Orders
                <span className="text-gray-500 ml-1">
                  {(adminData.orders||[]).length}
                </span>
              </h1>
            </div>
            <div className="overflow-x-hidden overlfow-y-auto h-[50vh]">
              {(adminData.orders||[]).map((order) => (
                <div
                  onClick={() => {
                    setOrderId(order.id)
                    $("body").addClass("overflow-hidden");
                    
                  }}
                  className="cursor-pointer items-center py-3 px-1 hover:bg-slate-100 w-full grid scale-95 "
                  style={{ gridTemplateColumns: "30% 50% 20%" }}
                >
                  <span className="text-base truncate">{order.user.name}</span>

                  <span className="mx-2 font-light text-sm text-slate-600 truncate">
                    {order.items.map((item) => `${item.name}, `)}
                  </span>
                  <span className="mx-2 text-base truncate text-center">
                    ${order.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {orderId?<AnOrder />:""}
    </main>
  );
};
