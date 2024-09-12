//Device Details 
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
  
    if (userId) {
        try {
            // Fetch the device details by ID from the backend
            const user = await window.api.getUserById(userId);
  
            // Ensure the `device-details` element exists before interacting with it
            const userDetails = document.getElementById('user-details');
            if (!userDetails) {
                console.error('user details container not found!');
                return;
            }
  
            // Render the basic device information first
            userDetails.innerHTML = `
                <div class="col-12 col-lg-8">
                  <div class="card h-100">
                    <div class="card-body">
                      <div class="border-bottom border-dashed pb-4">
                        <div class="row align-items-center g-3 g-sm-5 text-center text-sm-start">
                          <div class="col-12 col-sm-auto">
                            <input class="d-none" id="avatarFile" type="file" />
                            <label class="cursor-pointer avatar avatar-5xl" for="avatarFile"><img class="rounded-circle" src="../uploads/${user.profile_image}" alt="" /></label>
                          </div>
                          <div class="col-12 col-sm-auto flex-1">
                            <h3>${user.name}</h3>
                            <p class="text-body-secondary">Joined 3 months ago</p>
                            <div><a class="me-2" href="#!"><span class="fab fa-linkedin-in text-body-quaternary text-opacity-75 text-primary-hover"></span></a><a class="me-2" href="#!"><span class="fab fa-facebook text-body-quaternary text-opacity-75 text-primary-hover"></span></a><a href="#!"><span class="fab fa-twitter text-body-quaternary text-opacity-75 text-primary-hover"></span></a></div>
                          </div>
                        </div>
                      </div>
                      <div class="d-flex flex-between-center pt-4">
                        <div>
                          <h6 class="mb-2 text-body-secondary">Total Spent</h6>
                          <h4 class="fs-7 text-body-highlight mb-0">$894</h4>
                        </div>
                        <div class="text-end">
                          <h6 class="mb-2 text-body-secondary">Last Order</h6>
                          <h4 class="fs-7 text-body-highlight mb-0">1 week ago</h4>
                        </div>
                        <div class="text-end">
                          <h6 class="mb-2 text-body-secondary">Total Orders</h6>
                          <h4 class="fs-7 text-body-highlight mb-0">97 </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-lg-4">
                  <div class="card h-100">
                    <div class="card-body">
                      <div class="border-bottom border-dashed">
                        <h4 class="mb-3">Default Address
                          <button class="btn btn-link p-0" type="button"> <span class="fas fa-edit fs-9 ms-3 text-body-quaternary"></span></button>
                        </h4>
                      </div>
                      <div class="pt-4 mb-7 mb-lg-4 mb-xl-7">
                        <div class="row justify-content-between">
                          <div class="col-auto">
                            <h5 class="text-body-highlight">Address</h5>
                          </div>
                          <div class="col-auto">
                            <p class="text-body-secondary">Vancouver, British Columbia<br />Canada</p>
                          </div>
                        </div>
                      </div>
                      <div class="border-top border-dashed pt-4">
                        <div class="row flex-between-center mb-2">
                          <div class="col-auto">
                            <h5 class="text-body-highlight mb-0">Email</h5>
                          </div>
                          <div class="col-auto"><a class="lh-1" href="mailto:shatinon@jeemail.com">shatinon@jeemail.com</a></div>
                        </div>
                        <div class="row flex-between-center">
                          <div class="col-auto">
                            <h5 class="text-body-highlight mb-0">Phone</h5>
                          </div>
                          <div class="col-auto"><a href="tel:+1234567890">+1234567890</a></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            `;

            const userInfo = document.getElementById('tab-personal-info');
            if (!userInfo) {
                console.error('user tab info container not found!');
                return;
            }

            userInfo.innerHTML = `
                <div class="row gx-3 gy-4 mb-5">
                  <div class="col-12 col-lg-6">
                    <label class="form-label text-body-highlight fs-8 ps-0 text-capitalize lh-sm" for="fullName">Full name</label>
                    <input class="form-control" id="name" type="text" value="${user.name}" />
                  </div>
                  <div class="col-12 col-lg-6">
                    <label class="form-label text-body-highlight fs-8 ps-0 text-capitalize lh-sm" for="gender">Gender</label>
                    <select class="form-select" id="gender">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div class="col-12 col-lg-6">
                    <label class="form-label text-body-highlight fs-8 ps-0 text-capitalize lh-sm" for="email">Email</label>
                    <input class="form-control" id="email" type="text" placeholder="Email" />
                  </div>
                  <div class="col-12 col-lg-6">
                    <div class="row g-2 gy-lg-0">
                      <label class="form-label text-body-highlight fs-8 ps-1 text-capitalize lh-sm mb-1">Date of birth</label>
                      <div class="col-6 col-sm-2 col-lg-3 col-xl-2">
                        <select class="form-select" id="date">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                          <option value="13">13</option>
                          <option value="14">14</option>
                          <option value="15">15</option>
                          <option value="16">16</option>
                          <option value="17">17</option>
                          <option value="18">18</option>
                          <option value="19">19</option>
                          <option value="20">20</option>
                          <option value="21">21</option>
                          <option value="22">22</option>
                          <option value="23">23</option>
                          <option value="24">24</option>
                          <option value="25">25</option>
                          <option value="26">26</option>
                          <option value="27">27</option>
                          <option value="28">28</option>
                          <option value="29">29</option>
                          <option value="30">30</option>
                        </select>
                      </div>
                      <div class="col-6 col-sm-2 col-lg-3 col-xl-2">
                        <select class="form-select" id="month">
                          <option value="Jan">Jan</option>
                          <option value="Feb">Feb</option>
                          <option value="Mar">Mar</option>
                          <option value="Apr">Apr</option>
                          <option value="May">May</option>
                          <option value="Jun">Jun</option>
                          <option value="Jul">Jul</option>
                          <option value="Aug">Aug</option>
                          <option value="Sep">Sep</option>
                          <option value="Oct">Oct</option>
                          <option value="Nov">Nov</option>
                          <option value="Dec">Dec</option>
                        </select>
                      </div>
                      <div class="col-12 col-sm-8 col-lg-6 col-xl-8">
                        <select class="form-select" id="year">
                          <option value="1990">1990</option>
                          <option value="1991">1991</option>
                          <option value="1992">1992</option>
                          <option value="1993">1993</option>
                          <option value="1994">1994</option>
                          <option value="1995">1995</option>
                          <option value="1996">1996</option>
                          <option value="1997">1997</option>
                          <option value="1998">1998</option>
                          <option value="1999">1999</option>
                          <option value="2000">2000</option>
                          <option value="2001">2001</option>
                          <option value="2002">2002</option>
                          <option value="2003">2003</option>
                          <option value="2004">2004</option>
                          <option value="2005">2005</option>
                          <option value="2006">2006</option>
                          <option value="2007">2007</option>
                          <option value="2008">2008</option>
                          <option value="2009">2009</option>
                          <option value="2010">2010</option>
                          <option value="2011">2011</option>
                          <option value="2012">2012</option>
                          <option value="2013">2013</option>
                          <option value="2014">2014</option>
                          <option value="2015">2015</option>
                          <option value="2016">2016</option>
                          <option value="2017">2017</option>
                          <option value="2018">2018</option>
                          <option value="2019">2019</option>
                          <option value="2020">2020</option>
                          <option value="2021">2021</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-6">
                    <label class="form-label text-body-highlight fw-bold fs-8 ps-0 text-capitalize lh-sm" for="phone">Phone</label>
                    <input class="form-control" id="phone" type="text" placeholder="+1234567890" />
                  </div>
                  <div class="col-12 col-lg-6">
                    <label class="form-label text-body-highlight fw-bold fs-8 ps-0 text-capitalize lh-sm" for="alternative_phone">Alternative phone</label>
                    <input class="form-control" id="alternative_phone" type="text" placeholder="+1234567890" />
                  </div>
                  <div class="col-12 col-lg-4">
                    <label class="form-label text-body-highlight fw-bold fs-8 ps-0 text-capitalize lh-sm" for="facebook">Facebook</label>
                    <input class="form-control" id="facebook" type="text" placeholder="Facebook" />
                  </div>
                  <div class="col-12 col-lg-4">
                    <label class="form-label text-body-highlight fw-bold fs-8 ps-0 text-capitalize lh-sm" for="instagram">Instagram</label>
                    <input class="form-control" id="instagram" type="text" placeholder="Instagram" />
                  </div>
                  <div class="col-12 col-lg-4">
                    <label class="form-label text-body-highlight fw-bold fs-8 ps-0 text-capitalize lh-sm" for="twitter">Twitter</label>
                    <input class="form-control" id="twitter" type="text" placeholder="Twitter" />
                  </div>
                </div>
                <div class="text-end">
                  <button class="btn btn-primary px-7">Save changes</button>
                </div>
            `;
  
            //edit details function
            document.getElementById("edit-device-details").addEventListener('submit', async (event) => {
              event.preventDefault();
              const device_id = document.getElementById("device_id").value;
              const device_ip = document.getElementById("ip").value;
              const device_key = document.getElementById("serial").value;
              const device_name = document.getElementById("name").value;
              const device_area = document.getElementById("area").value;
              const device_entry = document.getElementById("entry").value;
            
              try {
                  await window.api.updateDevice(device_id, device_ip, device_key, device_name, device_area, device_entry);
                  console.log("Device area inserted successfully.");
                  // Add ?success to the current URL without refreshing the page
                  const newUrl = `${window.location.pathname}?deviceId=${device_id}&success=1`;
                  window.history.replaceState(null, null, newUrl);
                  // Optionally refresh the table or provide feedback to the user
              } catch (err) {
                  console.error('Failed to insert device area:', err);
              }
            });
  
            const urlParams = new URLSearchParams(window.location.search);
            const successAlert = document.getElementById("successAlert");
          
            if (urlParams.has('success')) {
              successAlert.style.display = "block";
            }
  
            
        } catch (err) {
            // If failed to load additional details, show offline message
            console.error('Failed to load user details:', err);
        }
    } else {
        console.error('No user ID found in query parameters');
    }
  });
  
  
  